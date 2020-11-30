import assert from 'assert'
import Debug from 'debug'
import { createReadStream, promises } from 'fs'
import { JWT } from 'google-auth-library'
import { extname } from 'path'
import { Edit, IEditParams, IShareRespone } from '../Edit'
import { IUploadFile, IUploadParams } from './Upload'

/**
 * @ignore
 */
const debug = Debug('apkup:Share')

export interface IShareParams {
  /** An array of objects that specify the files to upload for this release. */
  file: string
}

/**
 * Create an Upload to Google Play!
 */
export class Share extends Edit {
  private shareParams: IShareParams

  constructor (
    client: JWT,
    shareParams: IShareParams,
    editParams: IEditParams
  ) {
    super(client, editParams)

    assert(shareParams?.file, 'One file is required')
    this.shareParams = shareParams
  }

  public async makeEdits (): Promise<IShareRespone | string> {
    await this.checkFiles()
    const res = await this.uploadFiles()
    return res.data
  }

  private async checkFiles () {
    debug('> Checking file for sharing')
    await this.verifyFileExists(this.shareParams.file)
  }

  private async uploadFiles () {
    debug('> Uploading release')
    let uploadJob: any
    const fileToShare = this.shareParams.file
    const ext = extname(fileToShare)
    if (ext === '.apk') {
      uploadJob = await this.publisher.internalappsharingartifacts.uploadapk({
        media: {
          body: createReadStream(fileToShare),
          mimeType: 'application/octet-stream'
        },
        packageName: this.editParams.packageName
      })

      debug(
        `> Uploaded ${this.shareParams.file} with version code ${
          uploadJob.data.versionCode
        } and SHA1 ${uploadJob.data.binary && uploadJob.data.binary.sha1}`
      )
    } else if (ext === '.aab') {
      uploadJob = await this.publisher.internalappsharingartifacts.uploadbundle({
        media: {
          body: createReadStream(fileToShare),
          mimeType: 'application/octet-stream'
        },
        packageName: this.editParams.packageName
      })

      debug(
        `> Uploaded ${this.shareParams.file} with version code ${uploadJob.data.versionCode} and SHA1 ${uploadJob.data.sha1}`
      )
    }
    return uploadJob
  }

  private async verifyFileExists (file: string) {
    try {
      await promises.readFile(file)
    } catch (err) {
      debug(err)
      throw new Error(`File verification failed. Does ${file} exist?`)
    }
  }
}
