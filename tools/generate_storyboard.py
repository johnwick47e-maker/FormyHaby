#!/usr/bin/env python3
import os, json, sys
from pathlib import Path

try:
    from mutagen.mp3 import MP3
except Exception as e:
    print('MUTAGEN_MISSING')
    sys.exit(2)

p = Path('.')
images = []
videos = []
audios = []
for f in sorted(p.iterdir()):
    if f.is_file():
        ln = f.name.lower()
        if ln.endswith(('.jfif','.jpg','.jpeg','.png','.gif')):
            images.append(f.name)
        elif ln.endswith(('.mp4','.mov','.webm')):
            videos.append(f.name)
        elif ln.endswith(('.mp3','.m4a')):
            audios.append(f.name)

if not audios:
    print('No audio files found. Place the two mp3 files in the folder and retry.')
    sys.exit(3)

# choose two audio files: try to match by name
def find_audio(name_tokens):
    for a in audios:
        low = a.lower()
        for token in name_tokens:
            if token in low:
                return a
    return None

pangako_name = find_audio(['pangako'])
maging_name = find_audio(['maging','maging sino','maging sino ka'])
# fallback: pick first two distinct
picked = []
if pangako_name:
    picked.append(pangako_name)
if maging_name and maging_name!=pangako_name:
    picked.append(maging_name)
for a in audios:
    if a not in picked and len(picked)<2:
        picked.append(a)

if len(picked)==0:
    print('No audios matched/found')
    sys.exit(4)

# get durations
def audio_duration(fn):
    try:
        m = MP3(fn)
        return m.info.length
    except Exception as e:
        print('Failed reading',fn,e)
        return None

durations = []
for a in picked:
    d = audio_duration(a)
    durations.append((a,d))

print('Detected audio files and durations:')
for a,d in durations:
    print(' -',a,'=>',d,'seconds')

# collect media in a sensible order: prioritize some filenames if available
media = []
# prefer the main photo if exists
main_candidates = ['63b54e2d-17ca-4fb3-888d-8ea93aff4220.jfif']
for m in main_candidates:
    if m in images:
        media.append(m)
        images.remove(m)
# then other images
media += images
# then videos
media += videos

S = len(media)
if S==0:
    print('No images or videos found for slideshow')
    sys.exit(5)

# durations for songs
d1 = durations[0][1] or 60
d2 = durations[1][1] if len(durations)>1 and durations[1][1] else 60
if d2==0: d2=60

# split slides proportional to durations
n1 = max(1, round(S * (d1/(d1+d2))))
n2 = S - n1
if n2==0:
    n2=1
    n1=S-1

items = []
for i, m in enumerate(media):
    t = 'img' if m.lower().endswith(('.jfif','.jpg','.jpeg','.png','.gif')) else 'video'
    if i < n1:
        dur_ms = int((d1 / n1) * 1000)
    else:
        dur_ms = int((d2 / max(1,n2)) * 1000)
    items.append({
        'src': m,
        'type': t,
        'duration': dur_ms,
        'caption': ''
    })

# write storyboard.json
with open('storyboard.json','w',encoding='utf-8') as f:
    json.dump(items,f,indent=2,ensure_ascii=False)

print('\nGenerated storyboard.json with',len(items),'items.')
print('Slides for first song ({}s): {} slides'.format(round(d1,1), n1))
print('Slides for second song ({}s): {} slides'.format(round(d2,1), n2))
print('Done.')
