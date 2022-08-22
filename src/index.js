const searchExpressionRegExp = /TBC|TBD/;
const searchExpressionAsString = searchExpressionRegExp.toString().replace(/^\/|\/$/g, "");

let structure = []

const renameElement = (element, renameValue, type) => {
  const name = element.getName();

  if (name.search(searchExpressionRegExp) !== -1) {
    // Rename  Process 
    const newName = name.replace(searchExpressionRegExp, renameValue)
    Logger.log(`${type} old Name: ${name} | newName: ${newName}`)

    element.setName(newName)

    return {
      hasBeenRenamed: true,
      currentName: newName
    }
  }
  return {
    hasBeenRenamed: false,
    currentName: name
  }
}

const renameInsideFile = (file, renameValue) => {
  if (file?.getMimeType() === "application/vnd.google-apps.document") {
    const idFile = file.getId();
    const fileName = file.getName();
    const body = DocumentApp.openById(idFile)?.getBody();

    const rangeElement = body.findText(searchExpressionAsString);

    if (rangeElement) {
      Logger.log(`Renaming inner Text on: ${fileName}`)
      body.replaceText(searchExpressionAsString, renameValue);
      return true;
    }


  }
  return false;
}

const recursiveRename = (rootSource, renameValue, deepth) => {
  const folders = rootSource?.getFolders();

  if (!folders) return;

  while (folders.hasNext()) {
    const folder = folders.next();

    const renamed = renameElement(folder, renameValue, "Folder");
    const name = renamed?.currentName;

    const nameLine = `${("|  ").repeat(deepth)}📁 ${renamed?.hasBeenRenamed ? "𝐑𝐄𝐍𝐀𝐌𝐄𝐃" : ""} ${name}`;
    structure.push(nameLine)

    recursiveRename(folder, renameValue, deepth + 1)
  }

  const files = rootSource.getFiles();
  while (files.hasNext()) {
    const file = files.next();

    const renamed = renameElement(file, renameValue, "File");
    const name = renamed?.currentName;


    const hasBeenUpdatedInside = renameInsideFile(file, renameValue);

    const nameLine = `${("|  ").repeat(deepth)}📄 ${renamed?.hasBeenRenamed ? "𝐑𝐄𝐍𝐀𝐌𝐄𝐃" : ""} ${hasBeenUpdatedInside ? "𝐔𝐏𝐃𝐀𝐓𝐄𝐃" : ""} ${name}`;
    structure.push(nameLine)
  }
}

function renameTBC() {

  const rootFolderURL = SpreadsheetApp.getActiveSheet().getRange(2, 2).getValue();
  const renameValue = SpreadsheetApp.getActiveSheet().getRange(3, 2).getValue();

  Logger.log({ renameValue })
  
  const folderId = rootFolderURL.toString().split("/").pop()

  const rootFolder = DriveApp.getFolderById(folderId)

  const title = rootFolder.getName()

  structure.push(title)

  structure.push(("-").repeat(100));

  recursiveRename(rootFolder, renameValue, 0)


  const ui = SpreadsheetApp.getUi()

  ui.alert(
    'Please confirm',
    structure.join("\n"),
    ui.ButtonSet.OK);
}

const onUpdateTypeOfTool = () => {
  const typeOfRename = SpreadsheetApp.getActiveSheet().getRange(1, 2).getValue();

  const range = SpreadsheetApp.getActiveSheet().getRange(4, 1, 9, 2);

  if (typeOfRename === "TBC TBD") {
    range.setBackground("black");
  } else {
    range.setBackground("white");
  }
}
