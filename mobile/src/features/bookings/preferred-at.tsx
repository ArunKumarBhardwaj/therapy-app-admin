import { useState } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { StyleSheet } from 'react-native-unistyles'
import { formatVisit } from '@/lib/format'
import { ms } from '@/lib/scale'

type PreferredAtFieldProps = {
  value: Date
  onChange: (value: Date) => void
}

function mergeTime(date: Date, time: Date) {
  const next = new Date(date)
  next.setHours(time.getHours(), time.getMinutes(), 0, 0)
  return next
}

export function PreferredAtField({ value, onChange }: PreferredAtFieldProps) {
  const [showIos, setShowIos] = useState(false)

  function openAndroid() {
    DateTimePickerAndroid.open({
      value,
      mode: 'date',
      minimumDate: new Date(),
      onChange: (event, date) => {
        if (event.type !== 'set' || !date) return
        const withDate = mergeTime(date, value)
        DateTimePickerAndroid.open({
          value: withDate,
          mode: 'time',
          is24Hour: false,
          onChange: (timeEvent, time) => {
            if (timeEvent.type !== 'set' || !time) return
            onChange(mergeTime(withDate, time))
          },
        })
      },
    })
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Preferred time</Text>
      {Platform.OS === 'android' ? (
        <Pressable accessibilityRole="button" onPress={openAndroid} style={styles.value}>
          <Text style={styles.valueText}>{formatVisit(value.toISOString())}</Text>
        </Pressable>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowIos((open) => !open)}
            style={styles.value}
          >
            <Text style={styles.valueText}>{formatVisit(value.toISOString())}</Text>
          </Pressable>
          {showIos ? (
            <DateTimePicker
              value={value}
              mode="datetime"
              minimumDate={new Date()}
              onChange={(_event, date) => {
                if (date) onChange(date)
              }}
            />
          ) : null}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    gap: 8,
  },
  label: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(14),
    color: theme.colors.foreground,
  },
  value: {
    minHeight: 52,
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 14,
  },
  valueText: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(16),
    color: theme.colors.foreground,
  },
}))
