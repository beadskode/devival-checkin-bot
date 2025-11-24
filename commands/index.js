import { checkInData, checkInExcute } from './utility/checkin'
import { checkOutData, checkOutExcute } from './utility/checkout'
import { noteData, noteExcute } from './utility/note'

export default [
  {
    data: checkInData,
    excute: checkInExcute,
  }, 
  {
    data: checkOutData,
    excute: checkOutExcute,
  }, 
  {
    data: noteData,
    excute: noteExcute,
  },
]