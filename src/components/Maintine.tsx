import React, { useMemo, useState, useEffect } from 'react';
import {
  MantineProvider,
  useMantineTheme,
  ActionIcon,
  Flex,
  Text,
  Tooltip,
  Box,
} from '@mantine/core';
import { ModalsProvider, modals } from '@mantine/modals';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  MantineReactTable,
  useMantineReactTable,
  MRT_TableOptions,
  MRT_Row,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import { makeData, Person } from './../makeData';

const saveOnLocalStorage = (data) => {
  localStorage.setItem('local-data', JSON.stringify(data));
};

//@ts-ignore
const localDataStorage = JSON.parse(localStorage.getItem('local-data'));

const MaintineTable = () => {
  const [data, setData] = useState<Person[]>([]);
  const globalTheme = useMantineTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localDataStorage) {
        const response = makeData(2000);
        saveOnLocalStorage(response);
        setData(response);
        return;
      }
      setData(localDataStorage);
    }
  }, []);

  const averageSalary = useMemo(
    () => data.reduce((acc, curr) => acc + curr.salary, 0) / data.length,
    []
  );

  const maxAge = useMemo(
    () => data.reduce((acc, curr) => Math.max(acc, curr.age), 0),
    []
  );

  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      {
        header: 'First Name',
        accessorKey: 'firstName',
        ordinalNo: 1,
        enableGrouping: false,
      },
      {
        header: 'Last Name',
        ordinalNo: 2,
        accessorKey: 'lastName',
      },
      {
        header: 'Age',
        accessorKey: 'age',
        ordinalNo: 3,
        size: 120,
        aggregationFn: 'max',
        AggregatedCell: ({ cell, table }) => (
          <>
            Oldest by{' '}
            {table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header}:{' '}
            <Box
              sx={{ color: 'skyblue', display: 'inline', fontWeight: 'bold' }}
            >
              {cell.getValue<number>()}
            </Box>
          </>
        ),
      },
      {
        header: 'Gender',
        accessorKey: 'gender',
        ordinalNo: 4,
        editVariant: 'select',
        mantineEditSelectProps: {
          data: ['Male', 'Female'],
        },
        GroupedCell: ({ cell, row }) => (
          <Box sx={{ color: 'skyblue' }}>
            <strong>{cell.getValue<string>()}s </strong> ({row.subRows?.length})
          </Box>
        ),
      },
      {
        header: 'State',
        ordinalNo: 5,
        accessorKey: 'state',
      },
      {
        header: 'Salary',
        ordinalNo: 6,
        accessorKey: 'salary',
        aggregationFn: 'mean',
        AggregatedCell: ({ cell, table }) => (
          <>
            Average by{' '}
            {table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header}:{' '}
            <Box sx={{ color: 'green', fontWeight: 'bold' }}>
              {cell.getValue<number>()?.toLocaleString?.('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Box>
          </>
        ),
        Cell: ({ cell }) => (
          <>
            {cell.getValue<number>()?.toLocaleString?.('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </>
        ),
      },
    ],
    [averageSalary, maxAge]
  );

  const columnOrder = useMemo(
    () =>
      columns
        //@ts-ignore
        .sort((a, b) => a.ordinalNo - b.ordinalNo)
        .map((column) => column.accessorKey),
    [columns]
  );

  const handleDeleteRow = (userId) => {
    setData((prevData) => {
      const filteredData = prevData.filter((user) => user.id !== userId);
      saveOnLocalStorage(filteredData);
      return filteredData;
    });
  };

  const openDeleteConfirmModal = (row: MRT_Row<Person>) =>
    modals.openConfirmModal({
      title: 'Are you sure you want to delete this user?',
      children: (
        <Text>
          Are you sure you want to delete{' '}
          <span className='font-semibold'>
            {row.original?.firstName} {row.original?.lastName}
          </span>
          ?<div>This action cannot be undone.</div>
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: {
        sx: {
          '&:hover': {
            color: 'white !important',
            backgroundColor: '#ae2323',
          },
          backgroundColor: 'red',
          color: 'white',
        },
      },
      onConfirm: () => handleDeleteRow(row.original.id),
    });

  const handleSaveRow: MRT_TableOptions<Person>['onEditingRowSave'] = async ({
    exitEditingMode,
    row,
    values,
  }) => {
    data[row.index] = values;
    setData([...data]);
    saveOnLocalStorage([...data]);

    exitEditingMode();
  };

  const table = useMantineReactTable({
    columns,
    data: data,
    enableColumnResizing: true,
    enableGrouping: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableEditing: true,
    editDisplayMode: 'row',
    enableDensityToggle: false,
    onEditingRowSave: handleSaveRow,
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 80,
      },
    },
    positionGlobalFilter: 'left',
    mantinePaginationProps: {
      rowsPerPageOptions: ['50', '100', '250', '500'],
    },
    renderRowActions: ({ row, table }) => (
      <Flex gap='md'>
        <Tooltip label='Edit'>
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip label='Delete'>
          <ActionIcon
            sx={{
              color: '#fff',

              '&:hover': {
                color: '#f35959 !important',
              },
            }}
            onClick={() => openDeleteConfirmModal(row)}
          >
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),

    initialState: {
      density: 'xs',
      expanded: true,
      pagination: { pageIndex: 0, pageSize: 50 },
      sorting: [{ id: 'state', desc: false }],
      showGlobalFilter: true,
      columnOrder: [
        'mrt-row-actions',
        //@ts-ignore
        ...columnOrder,
      ],
    },
    mantineTableContainerProps: { sx: { maxHeight: 700 } },
    mantinePaperProps: {
      sx: {
        borderRadius: '20px',
      },
    },
    mantineToolbarAlertBannerBadgeProps: {
      sx: {
        margin: '0 0.5rem 0 0.5rem',
        background: 'var(--mainColor)',
      },
    },
    mantineTableProps: {
      striped: true,
    },
  });

  return (
    <ModalsProvider>
      <MantineProvider
        theme={{
          ...globalTheme,
          primaryColor: 'customOrange',
          primaryShade: 1,
          colors: {
            customOrange: [
              '#df8800',
              '#e2941a',
              '#e5a033',
              '#e9ac4d',
              '#ecb866',
            ],
          },
          colorScheme: 'dark',
        }}
      >
        <MantineReactTable table={table} />
      </MantineProvider>
    </ModalsProvider>
  );
};

export default MaintineTable;
