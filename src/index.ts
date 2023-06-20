import addDatePicker from "./addDatePicker";
import { FileList } from "./types"

export function transformFiles(files: FileList, transformation: string) {
  if (transformation === "addDatePicker") {
    return addDatePicker(files);
  }
  throw new Error("Unknown transformation");
}