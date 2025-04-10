type ClientArgs = {
  body?: object
  headers?: [string, string][] | Record<string, string>
  method?:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'ALL'
    | 'OPTIONS'
    | 'HEAD'
    | 'SEARCH'
  searchParams?: Record<string, string>[]
  url: string
}

export async function client({
  body,
  headers,
  method = 'GET',
  searchParams,
  url
}: ClientArgs) {
  let urlParam: string | URL = url

  if (searchParams) {
    const urlObject = new URL(url)

    searchParams.forEach(searchParam => {
      const key = Object.keys(searchParam)[0]
      urlObject.searchParams.append(key, searchParam[key])
    })

    urlParam = urlObject.href
  }

  const response = await fetch(urlParam, {
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-cache',
    credentials: 'same-origin',
    headers,
    method,
    mode: 'cors',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  })

  return await response.json()
}
