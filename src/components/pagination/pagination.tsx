import React, { FormEvent, useCallback } from 'react';
import { Button, Flex, Text, TextInput } from '@sanity/ui';
import { PatchEvent } from 'sanity';
import styled from 'styled-components';

interface PaginationProps {
    isEditable?: boolean;
    totalPages: number;
    currentPage: number;
    onPageChange?: (page: number) => void;
}

const StyledInput = styled(TextInput)`
    max-width: 70px;
    text-align: center;
`

export function Pagination({ totalPages, currentPage, isEditable, onPageChange }: PaginationProps) {
    const setPage = useCallback((page: number) => {
            if (isNaN(page)) {
                onPageChange?.(1);

                return
            }

            if (page < 1) {
                onPageChange?.(1);
                return
            }
        
            if (page > totalPages) {
                onPageChange?.(totalPages);
                return;
            }
            
            onPageChange?.(page);
    }, [totalPages])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  };

  const handleInputChange = (inputEvent: FormEvent<HTMLInputElement>) => {
    const newPage = inputEvent.currentTarget.valueAsNumber;
    
    setPage(newPage)
  };

  return (
    <Flex gap={3} align="center">
      <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} text={'Previous'} />
      {!isEditable && <Text>{currentPage} of {totalPages}</Text>}
      {isEditable && <><StyledInput type="number" value={currentPage.toString()} onInput={handleInputChange} /><Text> of {totalPages}</Text></>}
      <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} text="Next" />
    </Flex>
  );
};
