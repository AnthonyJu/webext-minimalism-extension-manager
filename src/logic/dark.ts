import { useStorageLocal } from '~/composables/useStorageLocal'

export const extTheme = useStorageLocal('ext-theme', 'light', { listenToStorageChanges: true })
