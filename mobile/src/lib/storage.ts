import * as Crypto from 'expo-crypto'
import * as SecureStore from 'expo-secure-store'
import { createMMKV, type MMKV } from 'react-native-mmkv'

const KEY_ACCOUNT = 'haven.mmkv.key'
const AES_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export type AppStore = {
  getString: (key: string) => string | null
  setString: (key: string, value: string) => void
  remove: (key: string) => void
}

let store: AppStore | null = null
let opening: Promise<AppStore> | null = null

function wrap(mmkv: MMKV): AppStore {
  return {
    getString: (key) => mmkv.getString(key) ?? null,
    setString: (key, value) => {
      mmkv.set(key, value)
    },
    remove: (key) => {
      mmkv.remove(key)
    },
  }
}

async function encryptionKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(KEY_ACCOUNT)
  if (existing && new TextEncoder().encode(existing).byteLength === 32) {
    return existing
  }
  const bytes = await Crypto.getRandomBytesAsync(32)
  const key = Array.from(bytes, (byte) => AES_ALPHABET[byte % AES_ALPHABET.length]).join('')
  await SecureStore.setItemAsync(KEY_ACCOUNT, key)
  return key
}

function openMmkv(): MMKV {
  return createMMKV({ id: 'haven' })
}

async function open(): Promise<AppStore> {
  try {
    const key = await encryptionKey()
    return wrap(
      createMMKV({
        id: 'haven',
        encryptionKey: key,
        encryptionType: 'AES-256',
      }),
    )
  } catch {
    return wrap(openMmkv())
  }
}

export function initStorage(): Promise<AppStore> {
  if (store) return Promise.resolve(store)
  if (!opening) {
    opening = open()
      .then((ready) => {
        store = ready
        return ready
      })
      .catch((error: unknown) => {
        opening = null
        throw error
      })
  }
  return opening
}

export function readStorage(): AppStore | null {
  return store
}
