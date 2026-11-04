from Eous.tools.web_controller.action_type import AtomicActionType


def SoM_args_conversion(actions, convert_marks_to_coordinates):
    args = []
    for action in actions:
        match AtomicActionType(action['name']):
            case AtomicActionType.Click:
                coordinate = convert_marks_to_coordinates(action['arguments']['mark_number'])
                args.append({'name': action['name'], 'arguments': {'x': coordinate.get('x', 0), 'y': coordinate.get('y', 0)}})
            case AtomicActionType.TypeText:
                coordinate = convert_marks_to_coordinates(action['arguments']['mark_number'])
                args.append({'name': action['name'], 'arguments': {'x': coordinate.get('x', 0), 'y': coordinate.get('y', 0), 'text': action['arguments']['text']}})
            case AtomicActionType.Scroll:
                if isinstance(action['arguments']['target'], str) and action['arguments']['target'].upper() == "WINDOW":
                    args.append(action)
                else:
                    coordinate = convert_marks_to_coordinates(action['arguments']['target'])
                    args.append({'name': action['name'], 'arguments': {'x': coordinate.get('x', 0), 'y': coordinate.get('y', 0), 'direction': action['arguments']['direction'], 'distance': action['arguments'].get('distance', 200)}})
            case _:
                args.append(action)
    return args