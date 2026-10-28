"""Recreate the 16 lesson clips from the two original class recordings.
Boundaries include silence padding; the last reading examples come from recitation 1.
"""
from pathlib import Path
import subprocess,json
root=Path(__file__).parent;out=root/'audio';out.mkdir(exist_ok=True)
# id, source, start, end, Arabic label
clips=[
('s0',2,1.96,2.66,'وَ'),('s1',2,2.80,3.48,'وُ'),('s2',2,3.68,4.48,'وِ'),
('s3',2,4.49,5.62,'وَا'),('s4',2,5.63,6.79,'وُو'),('s5',2,6.81,7.86,'وِي'),
('s6',2,7.93,8.73,'وًا'),('s7',2,8.77,9.65,'وٍ'),('s8',2,9.98,11.08,'وٌ'),
('s9',1,11.62,12.88,'أَوْ'),('s10',1,14.06,15.64,'وَرَ'),('s11',1,15.80,17.21,'أَبْ'),
('w0',2,11.38,12.78,'أَوْرَاق'),('w1',2,13.02,14.50,'حَاسُوب'),
('w2',2,14.67,16.45,'السَّلَام'),('w3',2,16.69,18.06,'مَدْرَسَة')]
for ident,source,start,end,label in clips:
 # Seek before decoding so fade times start at zero for each clip.
 duration=end-start
 subprocess.run(['ffmpeg','-v','error','-y','-ss',str(start),'-t',str(duration),'-i',str(root/f'recitation-{source}.m4a'),'-af',f'loudnorm=I=-18:TP=-2:LRA=7,afade=t=in:d=0.008,afade=t=out:st={duration-.012}:d=0.012','-ar','44100','-ac','1','-c:a','libmp3lame','-b:a','80k',str(out/f'{ident}.mp3')],check=True)
(out/'segments.json').write_text(json.dumps([dict(id=i,source=f'recitation-{s}.m4a',start=a,end=b,label=l) for i,s,a,b,l in clips],ensure_ascii=False,indent=2))
print('Created',len(clips),'clips;',sum(p.stat().st_size for p in out.glob('*.mp3')),'bytes')
