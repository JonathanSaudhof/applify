import { GoogleSpreadsheet } from "google-spreadsheet";
import { google } from "googleapis";
import { getOAuth } from "./auth";

export async function getAuthenticatedDrive() {
  return google.drive({ auth: await getOAuth(), version: "v3" });
}

export async function createSpreadSheet(sheetName: string, folderId: string) {
  const drive = await getAuthenticatedDrive();

  const sheet = await drive.files.create({
    requestBody: {
      name: sheetName,
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: [folderId],
    },
  });

  return sheet.data.id;
}

async function createTable({
  spreadSheetId,
  columns,
  title,
}: {
  spreadSheetId: string;
  title: string;
  columns: string[];
}) {
  const auth = await getOAuth();
  const doc = new GoogleSpreadsheet(spreadSheetId, auth);

  const sheet = await doc.addSheet({
    title,
    headerValues: columns,
  });

  return sheet;
}

async function readTable<T extends object>(
  spreadSheetId: string,
  tableName: string,
) {
  const auth = await getOAuth();
  const doc = new GoogleSpreadsheet(spreadSheetId, auth);
  await doc.loadInfo(); // loads document properties and worksheets

  const sheet = doc.sheetsByTitle[tableName];
  if (!sheet) {
    return [];
  }

  const rows = await sheet.getRows<T>();
  return rows;
}

const spreadsheetService = {
  createSpreadSheet,
  createTable,
  readTable,
};

export default spreadsheetService;
