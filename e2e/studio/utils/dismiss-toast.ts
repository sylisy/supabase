import { Page } from '@playwright/test'

export const dismissToast = async (page: Page) => {
  await page
    .locator('li.toast')
    .getByRole('button', { name: 'Opt out' })
    .waitFor({ state: 'visible' })
  await page.locator('li.toast').getByRole('button', { name: 'Opt out' }).click()
}

export const toKebabCase = (str: string) => str.replace(/([A-Z])/g, '-$1').toLowerCase()

export const dismissToastsIfAny = async (page: Page) => {
  const closeButtons = page.getByRole('button', { name: 'Close toast' })
  let count = await closeButtons.count()
  while (count > 0) {
    try {
      await closeButtons.first().click({ force: true, timeout: 2000 })
    } catch {
      // Toast may have auto-dismissed or been detached from the DOM
    }
    count = await closeButtons.count()
  }
}
