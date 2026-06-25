export interface ImageKitFile {
  fileId: string
  name: string
  url: string
  thumbnail?: string
  filePath: string
  size: number
  height?: number
  width?: number
}

export interface ImageKitListResponse {
  success: boolean
  files: ImageKitFile[]
}

export interface ImageKitAuthResponse {
  token: string
  expire: number
  signature: string
}
