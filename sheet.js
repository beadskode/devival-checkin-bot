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


//* 템플릿
const result = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: `${SHEET_NAME}!A2:F`,
});


//* 오늘 날짜로 탐색, 없을 시 신규 행 번호 return
export async function findRowData(sheetName, date) {
    try {
        if (!sheetName) new Error('no sheetName');
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: sheetName,
        });
        const rowNumber = result.findIndex(i => i[0] === date);
        const emptyRowNumber = result.findIndex(i => !i[0]);
        return rowNumber > 0 ? { rowNumber, rowData: result[rowNumber] } : { rowNumber: emptyRowNumber, rowData: null };
    } catch (error) {
        throw error;
    }
}

// QQQ
//* 행 추가
export async function createRow(sheetName, rowNumber, date, weekday, checkin='', checkout='', note='') {
    try {
        if (!sheetName) new Error('no sheetName');
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A${rowNumber}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[date, weekday, checkin, checkout, note]],
            },
        });
    } catch (error) {
        throw error;
    }
}

export async function updateCell(sheetName, rowNumber, columnRange = '', content) {
    // checkin: 'C', checkout: 'D', note: 'E'
    try {
        if (!columnRange) new Error('need ranage')
        if (!sheetName) new Error('need sheetName');
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!${columnRange}${rowNumber}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[content]],
            },
        });
    } catch (error) {
        throw error;
    }
}