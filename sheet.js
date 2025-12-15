import { google } from "googleapis";
import path from 'node:path';
import process from 'node:process';

// 서비스 계정에 편집 권한을 부여한 시트 ID
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

// 스코프: 스프레드시트 접근 권한
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// credentials.json 파일 위치
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// 구글로 로그인 ~ client 객체 반환
const auth = new google.auth.GoogleAuth({
  keyFile: CREDENTIALS_PATH,
  scopes: SCOPES,
});
const client = await auth.getClient();

// 시트 인스턴스 받아오기
const sheets = google.sheets({ version: "v4", auth: client });


//* 시트 이름 탐색
export async function getSheetName(userId, nickname) {
    try {
        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: '참가자',
            majorDimension: 'COLUMNS'
        });
        const [discordName, discordId, sheetName] = sheetData.data.values;

        const idIdx = discordId.indexOf(userId);
        const nameIdx = discordName.indexOf(nickname);
        
        if (nameIdx > 0 && idIdx <= 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `참가자!B${nameIdx+1}`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[userId]],
                },
            });
        }

        const userIdx = idIdx > 0 ? idIdx : nameIdx;
        if (userIdx > 0) return sheetName[userIdx];
        
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: '참가자!A:A',
            valueInputOption: 'RAW',
            requestBody: {
                values: [[nickname, userId, '']],
            },
        });
        return false;
    } catch (error) {
        console.log('error!!! :', error)
    }
}

//* 오늘 날짜로 탐색, 없을 시 신규 행 번호 return
export async function findRowData(sheetName, date) {
    try {
        if (!sheetName) throw Error('no sheetName');
        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:E`,
        });
        const result = sheetData.data.values;
        const rowNumber = result.findIndex(i => i[0] === date);

        if (rowNumber > 0) return { rowNumber: rowNumber + 1, rowData: result[rowNumber] };

        // Row 없을 경우 신규 행 생성
        await createRow(sheetName, result.length + 1, date);
        return { rowNumber: result.length + 1, rowData: [date, null, null, null, null] };
        
    } catch (error) {
        const errorTime = new Date(); 
        logger.error(`[findRowData] time: ${errorTime.toString()}
        ${error?.name} : ${error?.message}
        sheetName, date: ${sheetName}, ${date}
        `);
    }
}

//* 행 추가
export async function createRow(sheetName, rowNumber, date, checkin='', checkout='', note='') {
    try {
        if (!sheetName) throw Error('no sheetName');
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: sheetName,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[date, `=WEEKDAY(A${rowNumber})`, checkin, checkout, note]],
            },
        });
    } catch (error) {
        const errorTime = new Date(); 
        logger.error(`[createRow] time: ${errorTime.toString()}
        ${error?.name} : ${error?.message}
        sheetName, rowNumber, date, checkin, checkout, note: ${sheetName}, ${rowNumber}, ${date}, ${checkin}, ${checkout}, ${note}
        `);
    }
}

export async function updateCell(sheetName, rowNumber, columnRange = '', content) {
    // checkin: 'C', checkout: 'D', note: 'E'
    try {
        if (!columnRange) throw Error('need range')
        if (!sheetName) throw Error('need sheetName');
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!${columnRange}${rowNumber}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[content]],
            },
        });
    } catch (error) {
        const errorTime = new Date(); 
        logger.error(`[updateCell] time: ${errorTime.toString()}
        ${error?.name} : ${error?.message}
        sheetName, rowNumber, columnRange, content: ${sheetName}, ${rowNumber}, ${columnRange}, ${content}
        `);
    }
}