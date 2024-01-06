import { db, storage } from "firebase.js";
import { collection, getDoc, getDocs, setDoc, updateDoc, query, where, doc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

//////////////////////////////////////////////////////////////////
// DB STRUCTURE //////////////////////////////////////////////////
// CLOUD FIRESTORE 이용:
// 
// {기숙사} (collection) {
//     {index number} (document) {
//         code: 
//         title: 
//         index: 
//         isDeleted:
//         isDeactivated:
//         ...
//     }
//     meta (document) {
//         length: 
//         firstNotPlayed:
//         ...
//     }
//     ban (document) {
//         {video code}:
//     }
// }
//////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////
// BUTTON SETTINGS ///////////////////////////////////////////////
const lengthOfButons = 3;
const mouseoverTextOfButtons = ['', '', '']; // 공백일 경우 mouseover text가 표시되지 않음

const textOfButtons = ['다운로드', '삭제', '차단'];
const colorOfButtons = ['#4CAF50', '#f44336', '#f44336'];

const textOfClickedButtons = ['다운로드중', '삭제', '차단'];
const ColorOfClickedButtons = ['#808008', '#f44336', '#f44336'];

// 버튼 설정에 따라 함수 {buttonsInterantion}의 if문 부분을 수정하기 바람
buttonsInteraction // <- 어디있는지 모르겠으면 (vscode에서) 이걸 ctrl + 클릭
// 단, 단순히 버튼의 색깔을 조정한 경우에는 변경할 필요 없음

// ex) 버튼을 [다운로드, 삭제, 차단] 순서가 아닌 [차단, 다운로드, 삭제] 순서로 변경했다면
// 아래 if문에서 kindOfButton == '0' 일때 실행하는 함수를 banItem으로, 
// kindOfButton == '1' 일때 실행하는 함수를 getVideo로, 
// kindOfButton == '2' 일때 실행하는 함수를 deleteItem으로 변경한다.
//////////////////////////////////////////////////////////////////

const currentURL = new URL(window.location.href); // 현재 접속중인 url
const gisuksa = currentURL.split('/')[1]; // url에서 기숙사 종류 골라냄

let dbData;


//////////////////////////////////////////////////////////////////
//////////////////////// CODE STARTS HERE ////////////////////////
//////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', async function () {
    dbListData = await getData();
    fillList();
});


/**
 * 플레이리스트에 영상을 하나 추가하는 함수
 * @param {string} text 텍스트(영상 제목)
 * @param {string} code 등록할 영상 코드
 * @param {number} index db에서의 인덱스
 */
async function playlistAppend(text, code, index) {
    // 기본 구조(html형식을 간략하게, js형식 섞어서 나타낸 것임):
    // <ul id='playlist'>
    //   <li id=`li${index}`> (여러개)
    //     <div name='item-container'>
    //       <div name='thumbnail-container'>
    //         <img>
    //       <div name='text-container>
    //         <p>
    //       <div name='buttons-container'>
    //         <ul>
    //           <li> (여러개)
    //             <button>
    let playlist = document.getElementById('playlist');


    let liEliment = document.createElement('li');
    liEliment.id = 'li' + index;
    

    // make itemContainer
    let itemContainer = document.createElement('div');
    itemContainer.classList.add('playlist-item');
    itemContainer.classList.add('item-flex-container');
    itemContainer.name = 'item-container';
    
    
    // make thumbnailContainer
    let thumbnailContainer = document.createElement('div');
    thumbnailContainer.classList.add('thumbnail-container');
    thumbnailContainer.name = 'thumbnail-container';
    
    // get thumbnail
    let thumbnail = new Image();
    thumbnail.src = `https://i.ytimg.com/vi/${code}/default.jpg`; // 썸네일 이미지 링크
    thumbnailContainer.appendChild(thumbnail);
    
    
    // make textContainer
    let textContainer = document.createElement('div');
    textContainer.classList.add('text-container');
    textContainer.name = 'text-container';
    
    // make textEliment
    let textElement = document.createElement('p');
    textElement.classList.add('upper-text-eliment');
    textElement.appendChild(document.createTextNode(text));
    if (dbData[index].isDeactivated) {
        textElement.style.textDecoration = 'line-through';
    }
    textContainer.appendChild(textElement);
    
    // make buttonContainer
    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('buttons-container');
    
    // make buttonsUl
    let buttonsUl = document.createElement('ul');
    buttonsUl.classList.add('buttons-ul');

    
    // append buttons
    for (var i = 0; i < lengthOfButons; i++){
        // make buttonsLi
        let buttonsLi = document.createElement('li');
        buttonsLi.classList.add('buttons-li');
        
        let button = document.createElement('button');
        button.classList.add('round-button');
        button.id = 'button.' + i + '.' + index + '.' + code;
        // button.appendChild(document.createTextNode(textOfButtons[i]));
        button.innerHTML = textOfButtons[i];

        button.addEventListener('click', async function() {
            buttonsInteraction(this.id);
        });

        buttonsLi.appendChild(button);
        buttonsUl.appendChild(buttonsLi);
    }

    buttonsContainer.appendChild(buttonsUl);
    
    
    // 총합
    itemContainer.appendChild(thumbnailContainer);
    itemContainer.appendChild(textContainer);
    itemContainer.appendChild(buttonsContainer);
    
    liEliment.appendChild(itemContainer);

    playlist.appendChild(liEliment);
    
    return 0;
}


/**
 * 버튼 눌렀을 때 호출하는 함수
 * @param {string} thisId 클릭한 버튼의 Id
 * @returns 0
 */
async function buttonsInteraction(thisId) {
    let kindOfButton, index, code;
    [dummy, kindOfButton, index, code] = thisId.split('.');

    let liEliment = document.getElementById(thisId);
    liEliment.style.color = ColorOfClickedButtons[kindOfButton];
    liEliment.innerText = textOfClickedButtons[kindOfButton];

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 버튼 설정 변경 시 이 부분을 수정하시오 ///////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (kindOfButton == '0') {
        var res = await getVideo(code);
    } else if (kindOfButton == '1') {
        var res = await deleteItem(Number(index));
    } else if (kindOfButton == '2') {
        var res = await banItem(code);
        if (res == 'success') {
            res = await deleteItem(Number(index));
        }
    } else {
        window.alert("클릭한 버튼에 대한 기능이 존재하지 않습니다.");
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 버튼 설정 변경 시 이 부분을 수정하시오 ///////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    liEliment.style.color = colorOfButtons[kindOfButton];
    liEliment.innerText = textOfButtons[kindOfButton];

    window.alert(res + ' in ' + kindOfButton);

    return 0;
}


/**
 * db에서 지금 기숙사의 데이터 호출하는 함수
 * @returns 'success' or 'fail'
 */
async function getData() {
    // try{
        dbData = await getDocs(collection(db, `${gisuksa}`));

        return 'success';
    // } catch (e) {
    //     return 'fail';
    // }
}


/**
 * 유튜브 영상 코드 주면 그 영상 다운로드받는 함수
 * @todo firebase 기반으로 돌아가도록 수정하기
 * @deprecated 수정 전까지 사용 자제
 * @param {string} code 유튜브 영상 코드
 * @returns 'success' or 'fail'
 */
async function getVideo(code) {
    let button = document.getElementById(code);
    try {
        let response = await fetch(`/list/download?gen=${gisuksa}&index=${indexInDB}&code=${code}`, { method: 'GET' });
        console.log(response);

        if (!response.ok) {
            console.error('Server response was not ok.', response);
            return 'server error';
        }
        
        
        let blob = await response.blob();
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = code + '.mp3';
        a.click();

        if (response.headers.get('result') == 'success') {
            async function changePtagStyle() {
                let playlist = document.getElementById('playlist');
                pElement = playlist.children[indexInJS].children[0].children[1].children[0];
                pElement.style.textDecoration = 'line-through';
            }

            await changePtagStyle();
        }


        async function changeStyle() {
            button.innerHTML = '다운로드';
            button.style.backgroundColor = '#4CAF50';
        }

        await changeStyle();

        return 'success';
    } catch (error) {
        console.error('Error:', error);
        
        async function changeStyle() {
            button.innerHTML = '다운로드';
            button.style.backgroundColor = '#4CAF50';
        }
        
        await changeStyle();
        
        return 'catch error';
    }
    
}


/**
 * db에서 isDeleted = 1로 만들고 html에서 제거하는 함수
 * @param {number} buttonId 
 * @returns 
*/
async function deleteItem(buttonId) {
    // try {
    let kindOfButton, index, code;
    [dummy, kindOfButton, index, code] = buttonId.split('.');
    await updateDoc(doc(db, `${gisuksa}`, `${index}`), {
        idDeleted: 1
    });

    let liEliment = document.getElementById(`li${index}`);
    liEliment.remove();

    return 'success';
    // } catch (e) {
    //     return 'fail';
    // }
}


/**
 * 유튜브 영상 코드 받아서 dbData.ban 에 추가하는 함수
 * @param {string} code 유튜브 영상 코드 
 * @returns 'success' or 'fail'
 */
async function banItem(code) {
    // try{
        await setDoc(doc(bd, `${gisuksa}`, 'ban'), {
            [code]: 1
        });

        return 'success';
    // } catch (e) {
    //     if (flag) {
    //         bannedList.pop();
    //     }
    //     return 'fail';
    // }
}

/**
 * 입력받은 url을 서버로 전송, 서버에서 받은 응답에 따라 append할지 말지 결정
 * @param {string} url 유튜브 링크 url
 * @returns 'success' or 'fail'
 */
async function postLink(url) {
    // try {

    // } catch (e) {
    //     return 'fail';
    // }
}


/**
 * 최초 로드시 리스트 채우기
 * @returns 0
 */
async function fillList() {
    const l = dbData.meta.length;

    for (i = 0; i < l; i++) {
        if (!(dbData[i].isDeleted)) {
            playlistAppend(dbData[i].title, dbData[i].code, dbData[i].index);
        }
    }

    return 0;
}
