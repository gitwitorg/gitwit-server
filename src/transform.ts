import { FileList } from "./types"

export const transformations = [
  { id: 'addDatePicker', name: 'Add datepicker' },
  { id: 'addRouter', name: 'Add navigation router' },
  { id: 'addFirebaseAuth', name: 'Add Firebase authentication' },
  { id: 'addForm', name: 'Add AJAX form' },
  { id: 'addTable', name: 'Add AJAX table' },
  { id: 'addRadioGroup', name: 'Add Radio group' }
]

export async function transformFiles(files: FileList, transformation: string, activeFile: string) {

  const transformationsIds = transformations.map(t => t.id)

  if (transformationsIds.includes(transformation)) {
    const transform = await import(`./transformations/${transformation}`);
    return transform.default(files, activeFile);
  }

  throw new Error("Unknown transformation");
}