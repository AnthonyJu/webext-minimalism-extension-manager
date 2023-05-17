import { useStorageLocal } from '~/composables/useStorageLocal'

export const extOrder = useStorageLocal('ext-order', '1', { listenToStorageChanges: true })
