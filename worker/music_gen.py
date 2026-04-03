"""
PositiveSpace Worker - Music Generation with R2 Upload
Run with: modal run worker/music_gen.py --prompt "happy pop song"
"""
import modal
import io
import os

image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg")
    .pip_install("torch", "transformers", "scipy", "boto3")
)

app = modal.App("positivespace-worker")


@app.function(image=image, gpu="any", timeout=600, secrets=[
    modal.Secret.from_name("r2-secrets"),
])
def generate_and_upload(prompt: str, song_id: str) -> str:
    """
    Generate music and upload to Cloudflare R2.
    Returns the public URL of the uploaded audio.
    """
    from transformers import pipeline
    import scipy.io.wavfile
    import boto3
    
    print(f"Generating music for song_id: {song_id}")
    print(f"Prompt: {prompt}")
    
    # 1. Generate Musik
    synthesizer = pipeline("text-to-audio", model="facebook/musicgen-small")
    output = synthesizer(prompt, forward_params={"do_sample": True})
    
    # Convert to WAV
    buffer = io.BytesIO()
    scipy.io.wavfile.write(buffer, rate=output["sampling_rate"], data=output["audio"])
    audio_content = buffer.getvalue()
    print(f"Audio generated, size: {len(audio_content)} bytes")
    
    # 2. Upload ke Cloudflare R2
    s3 = boto3.client(
        's3',
        endpoint_url=os.environ["R2_ENDPOINT_URL"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"]
    )
    
    file_name = f"songs/{song_id}.wav"
    s3.put_object(
        Bucket=os.environ["R2_BUCKET_NAME"],
        Key=file_name,
        Body=audio_content,
        ContentType='audio/wav'
    )
    
    public_url = f"{os.environ['R2_PUBLIC_URL']}/{file_name}"
    print(f"Uploaded to: {public_url}")
    
    return public_url


@app.local_entrypoint()
def main(prompt: str, song_id: str = "test-song"):
    url = generate_and_upload.remote(prompt, song_id)
    print(f"Result: {url}")
    return url
