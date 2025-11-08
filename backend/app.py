from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
import subprocess
import uuid
from werkzeug.utils import secure_filename
import json
from routes.auth_routes import auth_bp

app = Flask(__name__)

# CORS Configuration - Allow all origins in development
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],  # In production, replace with your frontend URL
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Configuration
app.config["JWT_SECRET_KEY"] = "your-secret-key"  # use env var in production
app.config["UPLOAD_FOLDER"] = "uploads"
app.config["OUTPUT_FOLDER"] = "outputs"
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # 100MB max file size

jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
os.environ["PATH"] += os.pathsep + r"C:\ProgramData\chocolatey\bin"

# Create necessary directories
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(app.config["OUTPUT_FOLDER"], exist_ok=True)

ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'webm', 'mkv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_srt_file(subtitles, output_path):
    """
    Create an SRT file from subtitle data
    subtitles: list of dicts with 'start', 'end', 'text'
    Example: [{'start': 0.0, 'end': 2.5, 'text': 'Hello world'}]
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        for i, sub in enumerate(subtitles, 1):
            start_time = format_timestamp(sub['start'])
            end_time = format_timestamp(sub['end'])
            f.write(f"{i}\n")
            f.write(f"{start_time} --> {end_time}\n")
            f.write(f"{sub['text']}\n\n")

def format_timestamp(seconds):
    """Convert seconds to SRT timestamp format (HH:MM:SS,mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

@app.route('/')
def home():
    return jsonify({"message": "Flask backend with FFmpeg running!"})

@app.route('/api/upload', methods=['POST', 'OPTIONS'])
def upload_video():
    """Upload a video file"""
    if request.method == 'OPTIONS':
        return '', 204
        
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    
    file = request.files['video']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Allowed: mp4, mov, avi, webm, mkv"}), 400
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    original_filename = secure_filename(file.filename)
    extension = original_filename.rsplit('.', 1)[1].lower()
    filename = f"{file_id}.{extension}"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    
    file.save(filepath)
    
    # Get video metadata using ffprobe
    try:
        probe_cmd = [
            'ffprobe',
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            filepath
        ]
        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        metadata = json.loads(result.stdout)
        
        duration = float(metadata['format'].get('duration', 0))
        
        return jsonify({
            "success": True,
            "file_id": file_id,
            "filename": original_filename,
            "duration": duration,
            "message": "Video uploaded successfully"
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to process video: {str(e)}"}), 500

@app.route('/api/add-subtitles', methods=['POST', 'OPTIONS'])
def add_subtitles():
    """
    Add subtitles to video using FFmpeg
    """
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.json
    
    if not data or 'file_id' not in data or 'subtitles' not in data:
        return jsonify({"error": "Missing file_id or subtitles"}), 400
    
    file_id = data['file_id']
    subtitles = data['subtitles']
    style = data.get('style', {})
    
    # Find the input video file
    input_files = [f for f in os.listdir(app.config["UPLOAD_FOLDER"]) if f.startswith(file_id)]
    if not input_files:
        return jsonify({"error": "Video file not found"}), 404
    
    input_path = os.path.join(app.config["UPLOAD_FOLDER"], input_files[0])
    extension = input_files[0].rsplit('.', 1)[1]
    
    # Create SRT file
    srt_filename = f"{file_id}.srt"
    srt_path = os.path.join(app.config["UPLOAD_FOLDER"], srt_filename)
    create_srt_file(subtitles, srt_path)
    
    # Output file
    output_filename = f"{file_id}_subtitled.{extension}"
    output_path = os.path.join(app.config["OUTPUT_FOLDER"], output_filename)
    
    # FFmpeg command to burn subtitles
    # Style options
    font_size = style.get('font_size', 24)
    font_color = style.get('font_color', 'white')
    bg_color = style.get('bg_color', 'black@0.5')
    srt_path_ffmpeg = srt_path.replace('\\', '/').replace(':', '\\:')
    
    try:
        ffmpeg_cmd = [
            'ffmpeg',
            '-i', input_path,
            '-vf', f"subtitles={srt_path_ffmpeg}:force_style='FontSize={font_size},PrimaryColour=&H{font_color},BackColour=&H{bg_color}'",
            '-c:a', 'copy',  # Copy audio without re-encoding
            '-y',  # Overwrite output file if exists
            output_path
        ]
        
        subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
        
        return jsonify({
            "success": True,
            "output_file_id": file_id,
            "message": "Subtitles added successfully",
            "download_url": f"/api/download/{file_id}"
        }), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"FFmpeg error: {e.stderr.decode()}"}), 500
    except Exception as e:
        return jsonify({"error": f"Failed to add subtitles: {str(e)}"}), 500

@app.route('/api/add-simple-subtitles', methods=['POST', 'OPTIONS'])
def add_simple_subtitles():
    """
    Simplified endpoint for adding plain text subtitles
    """
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.json
    
    if not data or 'file_id' not in data or 'text' not in data:
        return jsonify({"error": "Missing file_id or text"}), 400
    
    file_id = data['file_id']
    subtitle_text = data['text']
    
    # Find the input video file
    input_files = [f for f in os.listdir(app.config["UPLOAD_FOLDER"]) if f.startswith(file_id)]
    if not input_files:
        return jsonify({"error": "Video file not found"}), 404
    
    input_path = os.path.join(app.config["UPLOAD_FOLDER"], input_files[0])
    extension = input_files[0].rsplit('.', 1)[1]
    
    # Get video duration
    probe_cmd = [
        'ffprobe',
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        input_path
    ]
    result = subprocess.run(probe_cmd, capture_output=True, text=True)
    metadata = json.loads(result.stdout)
    duration = float(metadata['format'].get('duration', 10))
    
    # Create subtitle for entire video
    subtitles = [{"start": 0.0, "end": duration, "text": subtitle_text}]
    
    # Create SRT file
    srt_filename = f"{file_id}.srt"
    srt_path = os.path.join(app.config["UPLOAD_FOLDER"], srt_filename)
    create_srt_file(subtitles, srt_path)
    
    # Output file
    output_filename = f"{file_id}_subtitled.{extension}"
    output_path = os.path.join(app.config["OUTPUT_FOLDER"], output_filename)
    srt_path_ffmpeg = srt_path.replace('\\', '/').replace(':', '\\:')

    try:
        ffmpeg_cmd = [
            'ffmpeg',
            '-i', input_path,
            '-vf', f"subtitles='{srt_path_ffmpeg}'",
            '-c:a', 'copy',
            '-y',
            output_path
        ]
        
        subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
        
        return jsonify({
            "success": True,
            "output_file_id": file_id,
            "message": "Subtitles added successfully",
            "download_url": f"/api/download/{file_id}"
        }), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"FFmpeg error: {e.stderr.decode()}"}), 500
    except Exception as e:
        return jsonify({"error": f"Failed to add subtitles: {str(e)}"}), 500

@app.route('/api/download/<file_id>', methods=['GET', 'OPTIONS'])
def download_video(file_id):
    """Download the processed video"""
    if request.method == 'OPTIONS':
        return '', 204
        
    output_files = [f for f in os.listdir(app.config["OUTPUT_FOLDER"]) if f.startswith(file_id)]
    
    if not output_files:
        return jsonify({"error": "Processed video not found"}), 404
    
    output_path = os.path.join(app.config["OUTPUT_FOLDER"], output_files[0])
    return send_file(output_path, as_attachment=True, download_name=f"video_with_subtitles.{output_files[0].rsplit('.', 1)[1]}")

@app.route('/api/cleanup/<file_id>', methods=['DELETE', 'OPTIONS'])
def cleanup_files(file_id):
    """Clean up uploaded and processed files"""
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        # Remove uploaded files
        for filename in os.listdir(app.config["UPLOAD_FOLDER"]):
            if filename.startswith(file_id):
                os.remove(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        
        # Remove output files
        for filename in os.listdir(app.config["OUTPUT_FOLDER"]):
            if filename.startswith(file_id):
                os.remove(os.path.join(app.config["OUTPUT_FOLDER"], filename))
        
        return jsonify({"success": True, "message": "Files cleaned up"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)