type SuccessDto<T = null> = {
  data: T | null
  error: string | null
  success: boolean
}
