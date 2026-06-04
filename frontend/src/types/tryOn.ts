export type TryOnStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'

export interface TryOnJob {
  jobId: string
  status: TryOnStatus
}

export interface TryOnStatusResponse {
  status: TryOnStatus
  resultUrl?: string
}
