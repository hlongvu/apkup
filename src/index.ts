import assert from 'assert'
import { JWT } from 'google-auth-library'
import { google } from 'googleapis'
import { IPromoteParams, Promote } from './actions/Promote'
import { IUploadParams, Upload } from './actions/Upload'
import { IShareParams, Share } from './actions/Share'
import { IEditParams, IEditResponse } from './Edit'

/* Object with Authentication information. */
export interface IAuthParams {
  /** Google Client Email */
  client_email: string
  /** Google Private Key */
  private_key: string
}

/**
 * Apkup constructor
 *
 * ```typescript
 * import { Apkup } from 'apkup'
 *
 * const auth = require('./auth.json')
 * const apkup = new Apkup(auth)
 * ```
 */
export class Apkup {
  private client: JWT

  /**
   * @param {object} auth Object with Authentication information.
   * @param {object} auth.client_email Google Client Email
   * @param {object} auth.private_key Google Private Key
   */
  constructor (auth: IAuthParams) {
    assert(auth.client_email, 'Missing required parameter client_email')
    assert(auth.private_key, 'Missing required parameter private_key')

    this.client = new google.auth.JWT(
      auth.client_email,
      undefined,
      auth.private_key,
      ['https://www.googleapis.com/auth/androidpublisher']
    )
  }

  /**
   * Upload a release to the Google Play Developer Console.
   * @param {object} uploadParams The params object includes the information for this release.
   * @param {object} editParams The package name of the app.
   *
   * @returns An object with the response data.
   *
   * ```typescript
   * const upload = await apkup.upload(
   *   {
   *     files: [
   *       {
   *         file: './android-debug.apk'
   *       }
   *     ],
   *     track: 'beta',
   *     releaseNotes: [
   *       {
   *         language: 'en-US',
   *         text: 'Minor bug fixes...'
   *       }
   *     ]
   *   },
   *   {
   *     packageName: 'io.event1.shared'
   *   }
   * )
   * ```
   */
  public async upload (
    uploadParams: IUploadParams,
    editParams: IEditParams
  ): Promise<IEditResponse> {
    const upload = new Upload(this.client, uploadParams, editParams)
    return upload.run()
  }

  /**
   * Promote a release from one track to another.
   *
   * @param {object} promoteParams Information related to the promotion.
   * @param {object} editParams The package name of the app.
   *
   * ```typescript
   * await apkup.promote(
   *   {
   *     track: 'alpha',
   *     versionCode: 137
   *   },
   *   {
   *     packageName: 'io.event1.shared'
   *  }
   * )
   * ```
   */
  public async promote (promoteParams: IPromoteParams, editParams: IEditParams) {
    const promote = new Promote(this.client, editParams, promoteParams)
    return promote.run()
  }

  public async share (
    shareParams: IShareParams,
    editParams: IEditParams
  ): Promise<IEditResponse> {
    const share = new Share(this.client, shareParams, editParams)
    return share.run()
  }
}
