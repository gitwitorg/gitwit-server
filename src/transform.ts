import addDatePicker from "./addDatePicker";
import addRouter from "./addRouter";
import addFirebaseAuth from "./addFirebaseAuth";
import { FileList } from "./types"

export function transformFiles(files: FileList, transformation: string) {
  if (transformation === "addDatePicker") {
    return addDatePicker(files);
  }
  else if (transformation === "addRouter") {
    return addRouter(files);
  }
  else if (transformation === "addFirebaseAuth") {
    return addFirebaseAuth(files);
  }
  throw new Error("Unknown transformation");
}