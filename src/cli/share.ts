// tslint:disable: no-console

import assert from 'assert'
import ora from 'ora'

import { IEditParams } from '../Edit'
import { Apkup } from '../index'
import { IShareParams } from '../actions/Share'
import { IUploadFile } from '../actions/Upload'

export const share = {
  aliases: ['$0'],
  builder: (cmd) => {
    return cmd
      .demandOption(['file'])
  },
  command: 'share [options]',
  desc: 'share a release',
  handler: (argv) => {
    const shareParams: IShareParams = {
      file : ''
    }
    const editParams: IEditParams = {
      packageName: argv.packageName
    }

    const shareFiles = argv.file.map(
      (fileListString: string): string => {
        const files = fileListString.split(',')

        // the actual file should always be first and should always be an AAB or APK
        const file = files[0]
        assert.strictEqual(
          file.endsWith('.apk') || file.endsWith('.aab'),
          true,
          'The first file must be either an APK or an AAB.'
        )
        return file
      }
    )

    shareParams.file = shareFiles[0]

    const apkup = new Apkup(argv.auth)

    const spinner = ora('Sharing APK...').start()

    apkup
      .share(shareParams, editParams)
      .then((resp) => {
        spinner.stop()

        console.log('Share successful!')
        console.log(resp)
      })
      .catch((err) => {
        spinner.stop()

        console.error('ERROR:', err.message)
        process.exit(1)
      })
  }
}
