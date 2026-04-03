import modal
import io

# 1. Definisi Environment (GPU + Libraries)
image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg")
    .pip_install("torch", "transformers", "scipy")
)

app = modal.App("positivespace-tester")

@app.function(
    image=image,
    gpu="any",      # Modal akan mencarikan GPU yang tersedia (T4/L4/A10G)
    timeout=600     # Beri waktu 10 menit untuk download model pertama kali
)
def generate_music(prompt: str):
    from transformers import pipeline
    import scipy.io.wavfile
    import numpy as np

    print(f"Sedang meracik musik untuk prompt: {prompt}...")
    
    # Load model (hanya dilakukan sekali di worker)
    synthesizer = pipeline("text-to-audio", model="facebook/musicgen-small")
    
    # Generate musik (durasi default sekitar 5-10 detik untuk testing)
    output = synthesizer(prompt, forward_params={"do_sample": True})
    
    # Konversi ke format WAV
    buffer = io.BytesIO()
    scipy.io.wavfile.write(buffer, rate=output["sampling_rate"], data=output["audio"])
    
    print("Musik selesai dibuat!")
    return buffer.getvalue()

@app.local_entrypoint()
def main():
    prompt = "upbeat lo-fi hip hop with smooth saxophone and rain background"
    audio_data = generate_music.remote(prompt)
    
    # Simpan hasil ke komputer lokal Anda
    with open("test_output.wav", "wb") as f:
        f.write(audio_data)
    print("Selesai! Cek file 'test_output.wav' di folder Anda.")
