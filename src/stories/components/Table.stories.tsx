import type {Meta, StoryObj} from '@storybook/react'

import {Table} from '@/components'
import {useEffect, useMemo, useState} from 'react'
import {createClient} from '@sanity/client'
import {Checkbox} from '@sanity/ui'

interface DataObject {
  _id: string
  title: string
}

type PagePropsAndCustomArgs = React.ComponentProps<typeof Table<DataObject>> & {
  createAmount: number
}

const client = createClient({
  projectId: 'cqsxcru2',
  dataset: 'production',
  token:
    'skjrTMszFTPRCb9JMpNQ1CJl6aCFLBF9WNSkfCAJri3mfl6lfoLeTcMrAqsFLdPh10dGRju73ukSw4IbZasgrTsMI64SvR3avdVlXrqAagEQxkMMDfbmtq7y9piPeKmlbB07SZ5i0SF60OUVFyrnlWa9kZAjLFCBL8QXCVQheiFcJObWI52K',
  useCdn: false,
  apiVersion: 'v2023-11-28',
})

const meta = {
  title: 'Components/Table',
  component: Table,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  render: ({createAmount = 100, pageSize, ...args}) => {
    const [renderKey, setKey] = useState('random1')
    const [data, setData] = useState<{_id: string; title: string}[]>([])
    useEffect(() => {
      const fetchInitialData = async () => {
        const response = await client.fetch<{_id: string; title: string}[]>(
          '*[_type == "movie"][0..99]',
        )
        setData((prevData) => [...response, ...prevData])
        setKey('random2')
      }

      const fetchRemainingData = async () => {
        const response = await client.fetch<{_id: string; title: string}[]>(
          '*[_type == "movie"][100..32000]',
        )
        setData((prevData) => [...prevData, ...response])
        setKey('random3')
      }

      fetchInitialData()
      fetchRemainingData()
    }, [])

    console.log(data)

    // useEffect(async () => {

    //     setData(result)
    // }, [])

    // const data = useMemo(() => {
    //     const result = await client.fetch<{_id: string; title: string}>('*[_type == "movie"]')

    //     return result
    //   /* const result = []
    //   for (let i = 0; i < createAmount; i++) {
    //     result.push({id: i, name: `Name ${i}`})
    //   }
    //   return result */
    // }, [createAmount])
    return <Table key={renderKey} columns={args.columns} data={data} pageSize={pageSize} />
  },
} satisfies Meta<PagePropsAndCustomArgs>

export default meta
type Story = StoryObj<PagePropsAndCustomArgs>

const TOTAL = 10000

const columns = [
  {
    id: 'select',
    header: ({table}) => (
      <Checkbox
        {...{
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
      />
    ),
    cell: ({row}) => (
      <div className="px-1">
        <Checkbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      </div>
    ),
  },
  {
    accessorKey: 'title',
    header: () => 'Title',
  },
]

export const NormalTable: Story = {
  args: {
    columns,
    createAmount: TOTAL,
    pageSize: 20,
  },
}
