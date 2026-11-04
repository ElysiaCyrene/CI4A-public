'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import TableContext from './TableContext';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import { getTableUtilityClass } from './tableClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, stickyHeader } = ownerState;

  const slots = {
    root: ['root', stickyHeader && 'stickyHeader'],
  };

  return composeClasses(slots, getTableUtilityClass, classes);
};

const TableRoot = styled('table', {
  name: 'MuiTable',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.root, ownerState.stickyHeader && styles.stickyHeader];
  },
})(
  memoTheme(({ theme }) => ({
    display: 'table',
    width: '100%',
    borderCollapse: 'collapse',
    borderSpacing: 0,
    '& caption': {
      ...theme.typography.body2,
      padding: theme.spacing(2),
      color: (theme.vars || theme).palette.text.secondary,
      textAlign: 'left',
      captionSide: 'bottom',
    },
    variants: [
      {
        props: ({ ownerState }) => ownerState.stickyHeader,
        style: {
          borderCollapse: 'separate',
        },
      },
    ],
  })),
);

const defaultComponent = 'table';

const Table = React.forwardRef(function Table(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiTable' });
  const {
    className,
    component = defaultComponent,
    padding = 'normal',
    size = 'medium',
    stickyHeader = false,
    ...other
  } = props;

  const ownerState = {
    ...props,
    component,
    padding,
    size,
    stickyHeader,
  };

  const classes = useUtilityClasses(ownerState);

  // ===================== Agent API =====================
  const domRef = React.useRef(null);
  const [apiAttrs, setApiAttrs] = React.useState({});

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.__ci4a__) {
      const attrs = window.__ci4a__.register('table', {
        getTableStatus: {
          handler: () => {
            const tableEl = domRef.current;
            const rows = tableEl?.querySelectorAll('tbody tr');
            const headCells = tableEl?.querySelectorAll('thead th, thead td');
            const columns = Array.from(headCells || []).map((cell) => cell.textContent?.trim());
            const hasCheckbox = !!tableEl?.querySelector('thead input[type="checkbox"]');
            const data = Array.from(rows || []).map((row, idx) => {
              const cells = row.querySelectorAll('td, th');
              const checkbox = row.querySelector('input[type="checkbox"]');
              return {
                key: String(idx),
                cells: Array.from(cells).map((cell) => cell.textContent?.trim()),
                selected: checkbox ? !!checkbox.checked : undefined,
              };
            });
            // Check select-all state
            const selectAllCheckbox = tableEl?.querySelector('thead input[type="checkbox"]');
            const allSelected = hasCheckbox && selectAllCheckbox ? !!selectAllCheckbox.checked : undefined;
            return {
              data: {
                columns,
                rowCount: data.length,
                rows: data,
                hasCheckbox,
                allSelected,
                stickyHeader,
                size,
                padding,
              },
            };
          },
          description: 'Get table columns, rows (with key + selected state), and metadata.',
          params: [],
        },
        selectRow: {
          handler: (key) => {
            const tableEl = domRef.current;
            if (!tableEl) return { error: { code: 'NOT_RENDERED', message: 'Table DOM not available.' } };
            const rows = tableEl.querySelectorAll('tbody tr');
            const k = String(key);
            const idx = parseInt(k, 10);
            let targetRow = null;
            if (!isNaN(idx) && idx >= 0 && idx < rows.length) targetRow = rows[idx];
            if (!targetRow) {
              return { error: { code: 'ITEM_NOT_FOUND', message: `Row "${k}" not found. Use key from getTableStatus rows[].key (0, 1, ...).` } };
            }
            const checkbox = targetRow.querySelector('input[type="checkbox"]');
            if (!checkbox) return { error: { code: 'NO_CHECKBOX', message: `Row "${k}" has no checkbox.` } };
            if (checkbox.disabled) return { error: { code: 'ITEM_DISABLED', message: `Row "${k}" checkbox is disabled.` } };
            checkbox.click();
            return { data: { key: k, selected: !!checkbox.checked } };
          },
          description: 'Toggle row selection by key (from getTableStatus rows[].key). Only works on tables with checkbox rows.',
          params: [{ name: 'key', type: 'string', required: true, description: 'Row key from getTableStatus rows[].key (e.g. "0").' }],
        },
        selectAllRows: {
          handler: () => {
            const tableEl = domRef.current;
            if (!tableEl) return { error: { code: 'NOT_RENDERED', message: 'Table DOM not available.' } };
            const selectAllCb = tableEl.querySelector('thead input[type="checkbox"]');
            if (!selectAllCb) return { error: { code: 'NO_CHECKBOX', message: 'Table has no select-all checkbox in header.' } };
            if (selectAllCb.disabled) return { error: { code: 'ITEM_DISABLED', message: 'Select-all checkbox is disabled.' } };
            selectAllCb.click();
            return { data: { allSelected: !!selectAllCb.checked } };
          },
          description: 'Toggle select-all checkbox. Only works on tables with a header checkbox.',
          params: [],
        },
      });
      setApiAttrs(attrs);
      return () => { window.__ci4a__?.unregister(attrs['data-cid']); };
    }
  }, []);

  const mergedRef = React.useCallback((node) => {
    domRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  const table = React.useMemo(
    () => ({ padding, size, stickyHeader }),
    [padding, size, stickyHeader],
  );

  return (
    <TableContext.Provider value={table}>
      <TableRoot
        as={component}
        role={component === defaultComponent ? null : 'table'}
        ref={mergedRef}
        className={clsx(classes.root, className)}
        ownerState={ownerState}
        {...apiAttrs}
        {...other}
      />
    </TableContext.Provider>
  );
});

Table.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the table, normally `TableHead` and `TableBody`.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * Allows TableCells to inherit padding of the Table.
   * @default 'normal'
   */
  padding: PropTypes.oneOf(['checkbox', 'none', 'normal']),
  /**
   * Allows TableCells to inherit size of the Table.
   * @default 'medium'
   */
  size: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['medium', 'small']),
    PropTypes.string,
  ]),
  /**
   * Set the header sticky.
   * @default false
   */
  stickyHeader: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default Table;
