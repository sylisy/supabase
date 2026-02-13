import { DatabaseExtension } from 'data/database-extensions/database-extensions-query'
import { useState } from 'react'
import { Button } from 'ui'

import { InstallExtensionModal } from '@/components/interfaces/Database/Extensions/InstallExtensionModal'

export const MissingExtensionAlert = ({ extension }: { extension: DatabaseExtension }) => {
  const [showInstallExtensionModal, setShowInstallExtensionModal] = useState(false)

  const extensionInstalled = !!extension?.installed_version
  if (!extensionInstalled) {
    return (
      <>
        <Button type="primary" className="w-min" onClick={() => setShowInstallExtensionModal(true)}>
          Install {extension.name}
        </Button>

        <InstallExtensionModal
          visible={showInstallExtensionModal}
          extension={extension}
          onCancel={() => setShowInstallExtensionModal(false)}
        />
      </>
    )
  }
  return null
}
