import { useStorageLocal } from '~/composables/useStorageLocal'

export const themeIsDark = useStorageLocal('ext-theme', false, { listenToStorageChanges: true })
