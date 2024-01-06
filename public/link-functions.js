/**
 * 유튜브 링크 받아서 영상 코드 반환하는 함수
 * @param {string} url 유튜브 영상 링크
 * @returns 유튜브 영상 코드 or null
 */
function getVideoCode(url) {
    const re = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com\/(?:(?:v\/|e\/|embed\/)|.*?(?:v=|v%3D))|youtu\.be\/)([a-zA-Z0-9-_]{11})/;
    const m = url.match(re);

    if (m){
        return m[1];
    } else {
        return null
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
require('dotenv').config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * 유튜브 영상 코드를 받아서 영상 길이(초), 제목 반환하는 함수
 * @param {string} code 유튜브 영상 고유 코드(영어 대소문자, 하이폰(-), 언더바(_) 11자리)
 * @returns title: 영상 제목, duration: 영상 길이
 */
async function getVideoInfo(code) {
    // try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${code}&key=${YOUTUBE_API_KEY}`);
    const data = await response.json();

    const videoInfo = data.items[0];
    const title = videoInfo.snippet.title;
    const duration = videoInfo.contentDetails.duration;

    const regex = /PT(\d+(?:H))?(\d+(?:M))?(\d+(?:S))?/;
    const m = time.match(regex);
    
    const generatedDuration = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);

    return {
        title: title,
        duration: generatedDuration
    };
    // } catch (e) {
    //     return 'error'
    // }
}

// getVideoInfo('6VQ_I5dT-WI')
// .then((result) => {
//     console.log(result);
// });