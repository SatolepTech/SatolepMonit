import { format } from 'date-fns'

export function formatDate(date: string | Date, mask = 'dd/MM/yyyy') {
  return format(new Date(date), mask)
}

export function formatDatetime(
  date: string | Date,
  mask = 'dd/MM/yyyy HH:mm'
) {
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) {
    return ''
  }
  return format(parsedDate, mask)
}
