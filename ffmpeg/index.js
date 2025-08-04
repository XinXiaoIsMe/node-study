const { execSync } = require('child_process')

// 转换格式 avi/gif/mp3 ...
// execSync('ffmpeg -i video.mp4 video.mp3', { stdio: 'inherit' })

// 裁剪 从第2s到第4s
// execSync('ffmpeg -ss 2 -i video.mp4 -t 2 -c copy video2.mp4', { stdio: 'inherit' })

// 添加水印
// execSync('ffmpeg -i video.mp4 -vf drawtext=text="ccattempt":x=100:y=500:fontsize=50:fontcolor=yellow video3.mp4', { stdio: 'inherit' })

// 删除水印（实际只是将水印模糊化了，并没有真的删除）
execSync(`ffmpeg -i video3.mp4 -vf delogo=w=225:h=100:x=100:y=500 video4.mp4`, { stdio: 'inherit' })