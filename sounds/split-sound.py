from pydub import AudioSegment
from pydub.utils import make_chunks

myaudio = AudioSegment.from_file("Gitarre-Chromatisch-16bit.wav" , "wav") 
chunk_length_ms = 2000 # pydub calculates in millisec
chunks = make_chunks(myaudio, chunk_length_ms) #Make chunks of one sec

#Export all of the individual chunks as wav files

for i, chunk in enumerate(chunks):
    chunk_name = f"git-mid{(i+40):02}.wav"
    print("exporting", chunk_name)
    chunk.export(chunk_name, format="wav")
    if (i == 40):
        print(f"Break after {1+i} chunks.")
        break