import addDatePicker from "./addDatePicker";
import addRouter from "./addRouter";
import addFirebaseAuth from "./addFirebaseAuth";
import addForm from "./addForm";
import addTable from "./addTable";
import addRadioGroup from "./addRadioGroup";

import { FileList } from "./types"

export function transformFiles(files: FileList, transformation: string, activeFile: string) {
  if (transformation === "addDatePicker") {
    return addDatePicker(files, activeFile);
  }
  else if (transformation === "addRouter") {
    return addRouter(files);
  }
  else if (transformation === "addFirebaseAuth") {
    return addFirebaseAuth(files);
  }
  else if (transformation === "addForm") {
    return addForm(files, activeFile);
  }
  else if (transformation === "addTable") {
    return addTable(files, activeFile);
  }
  else if (transformation === "addRadioGroup") {
    return addRadioGroup(files, activeFile);
  }
  throw new Error("Unknown transformation");
}