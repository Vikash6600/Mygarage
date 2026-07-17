import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { InternalServerError } from '@/lib/errors'
import { LoggerService } from '@/services/logger'

export interface IStorageService {
  uploadFile(file: Buffer | Blob, path: string, mimeType: string): Promise<string>
  deleteFile(path: string): Promise<void>
  replaceFile(file: Buffer | Blob, oldPath: string, newPath: string, mimeType: string): Promise<string>
  getFileUrl(path: string): string
}

export class SupabaseStorageService implements IStorageService {
  private _client: SupabaseClient | null = null
  private _bucket: string | null = null

  private getClientAndBucket() {
    if (this._client && this._bucket) {
      return { client: this._client, bucket: this._bucket }
    }
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_ANON_KEY
    const bucket = process.env.SUPABASE_BUCKET

    if (!url || !key || !bucket) {
      throw new InternalServerError('Supabase configuration is missing in environment variables.')
    }

    this._client = createClient(url, key)
    this._bucket = bucket
    return { client: this._client, bucket: this._bucket }
  }

  async uploadFile(file: Buffer | Blob, path: string, mimeType: string): Promise<string> {
    const { client, bucket } = this.getClientAndBucket()
    try {
      const { data, error } = await client.storage
        .from(bucket)
        .upload(path, file, {
          contentType: mimeType,
          cacheControl: '31536000',
          upsert: true
        })

      if (error) {
        throw error
      }

      await LoggerService.info('FILE_UPLOADED', { path, bucket })
      return path
    } catch (err: any) {
      await LoggerService.error('FILE_UPLOAD_FAILED', err)
      throw new InternalServerError(`Failed to upload file: ${err.message || 'Unknown error'}`)
    }
  }

  async deleteFile(path: string): Promise<void> {
    const { client, bucket } = this.getClientAndBucket()
    try {
      const { error } = await client.storage
        .from(bucket)
        .remove([path])

      if (error) {
        throw error
      }

      await LoggerService.info('FILE_DELETED', { path, bucket })
    } catch (err) {
      await LoggerService.error('FILE_DELETE_FAILED', err)
      throw new InternalServerError('Failed to delete file.')
    }
  }

  async replaceFile(file: Buffer | Blob, oldPath: string, newPath: string, mimeType: string): Promise<string> {
    try {
      await this.deleteFile(oldPath)
      return await this.uploadFile(file, newPath, mimeType)
    } catch (err) {
      await LoggerService.error('FILE_REPLACE_FAILED', err)
      throw new InternalServerError('Failed to replace file.')
    }
  }

  getFileUrl(path: string): string {
    const { client, bucket } = this.getClientAndBucket()
    const { data } = client.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  }
}

export const storageService = new SupabaseStorageService()
