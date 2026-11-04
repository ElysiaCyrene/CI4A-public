import '../AgentApiRegistry/AgentApiRegistry.js';
'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import FormGroup from '../FormGroup';
import { getRadioGroupUtilityClass } from './radioGroupClasses';
import useForkRef from '../utils/useForkRef';
import useControlled from '../utils/useControlled';
import RadioGroupContext from './RadioGroupContext';
import useId from '../utils/useId';

const useUtilityClasses = (props) => {
  const { classes, row, error } = props;

  const slots = {
    root: ['root', row && 'row', error && 'error'],
  };

  return composeClasses(slots, getRadioGroupUtilityClass, classes);
};

const RadioGroup = React.forwardRef(function RadioGroup(props, ref) {
  const {
    // private
    // eslint-disable-next-line react/prop-types
    actions,
    children,
    className,
    defaultValue,
    name: nameProp,
    onChange,
    value: valueProp,
    ...other
  } = props;
  const rootRef = React.useRef(null);

  const classes = useUtilityClasses(props);

  const domRef = React.useRef(null);
  const [apiAttrs, setApiAttrs] = React.useState({});
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.__ci4a__) {
      const attrs = window.__ci4a__.register('radiogroup', {
        getRadioGroupStatus: { handler: () => ({ data: { value, disabled: !!other.disabled } }), description: 'Get radio group value.', params: [] },
        setValue: { handler: (val) => { if (other.disabled) return { error: { code: 'COMPONENT_DISABLED' } }; setValueState(val); onChange?.({ target: { value: val } }, val); return { data: { value: val } }; }, description: 'Set value.', params: [{ name: 'value', type: 'string', required: true }] },
      });
      setApiAttrs(attrs);
      return () => { window.__ci4a__?.unregister(attrs['data-cid']); };
    }
  }, []);
  const [value, setValueState] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: 'RadioGroup',
  });

  React.useImperativeHandle(
    actions,
    () => ({
      focus: () => {
        let input = rootRef.current.querySelector('input:not(:disabled):checked');

        if (!input) {
          input = rootRef.current.querySelector('input:not(:disabled)');
        }

        if (input) {
          input.focus();
        }
      },
    }),
    [],
  );

  const handleRef = useForkRef(ref, rootRef);

  const name = useId(nameProp);

  const contextValue = React.useMemo(
    () => ({
      name,
      onChange(event) {
        setValueState(event.target.value);

        if (onChange) {
          onChange(event, event.target.value);
        }
      },
      value,
    }),
    [name, onChange, setValueState, value],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <FormGroup
        role="radiogroup"
        ref={handleRef}
        {...apiAttrs}
        className={clsx(classes.root, className)}
        {...other}
      >
        {children}
      </FormGroup>
    </RadioGroupContext.Provider>
  );
});

RadioGroup.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue: PropTypes.any,
  /**
   * The name used to reference the value of the control.
   * If you don't provide this prop, it falls back to a randomly generated name.
   */
  name: PropTypes.string,
  /**
   * Callback fired when a radio button is selected.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event The event source of the callback.
   * @param {string} value The value of the selected radio button.
   * You can pull out the new value by accessing `event.target.value` (string).
   */
  onChange: PropTypes.func,
  /**
   * Value of the selected radio button. The DOM API casts this to a string.
   */
  value: PropTypes.any,
};

export default RadioGroup;
