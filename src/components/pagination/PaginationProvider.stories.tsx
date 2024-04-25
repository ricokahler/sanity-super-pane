import React, {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {PaginationProvider, usePagination} from './PaginationProvider'
import {Pagination} from './pagination'
import { Stack, Text } from '@sanity/ui'

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  tags: ['autodocs'],
  component: Pagination,
  render: ({isEditable}) => {
    const {currentPage, totalItems, setCurrentPage} = usePagination()
    return <Pagination totalPages={totalItems} currentPage={currentPage} onPageChange={setCurrentPage} isEditable={isEditable} />
  },
  decorators: [
    (Story) => {
      const [currentPage, setCurrentPage] = useState(1)
      const totalItems = 100 // Example total items
      const itemsPerPage = 10

      return (
        <PaginationProvider
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setTotalItems={() => {}} // Stub function, as totalItems is static in this example
          setItemsPerPage={() => {}} // Stub function, as itemsPerPage is static in this example
        >
          <Stack space={4}>
            <Text>Current page: {currentPage}</Text>
            <Story />
          </Stack>
        </PaginationProvider>
      )
    },
  ],
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

// Define stories here
export const DefaultPagination: Story = {
  args: {
    // Default args for your Pagination component
  },
}

// Define stories here
export const Editable: Story = {
  args: {
    isEditable: true,
    // Default args for your Pagination component
  },
}
