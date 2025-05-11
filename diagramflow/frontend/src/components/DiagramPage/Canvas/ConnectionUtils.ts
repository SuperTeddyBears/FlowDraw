// connectionUtils.ts
export enum ConnectionType {
    Default = 'default',
    ZeroToOne = '0-to-1',
    ZeroToManyOptional = '0-to-many-optional',
    OneMandatoryToOneOptional = '1-mandatory-to-1-optional',
    OneMandatoryToManyMandatory = '1-mandatory-to-many-mandatory',
    OneMandatoryToManyOptional = '1-mandatory-to-many-optional',
    OneMandatory = '1-mandatory',
    OneOptionalToManyMandatory = '1-optional-to-many-mandatory',
    OneOptionalToManyOptional = '1-optional-to-many-optional',
    OneToOne = '1-to-1',
    OneToMany = '1-to-many',
    One = '1',
    ManyMandatoryToManyMandatory = 'many-mandatory-to-many-mandatory',
    ManyOptionalToManyMandatory = 'many-optional-to-many-mandatory',
    ManyOptionalToManyOptional = 'many-optional-to-many-optional',
    ManyToMany = 'many-to-many',
    Many = 'many'
}

export interface EndpointImages {
    start: string;
    end: string;
}

const DOT = '';  // Empty string means use a simple dot/circle

export const connectionEndpoints: Record<ConnectionType, EndpointImages> = {
    [ConnectionType.Default]: { start: DOT, end: 'to-1.svg' },
    [ConnectionType.ZeroToOne]: { start: DOT, end: 'to-1-optional.svg' },
    [ConnectionType.ZeroToManyOptional]: { start: DOT, end: 'to-many-optional.svg' },
    [ConnectionType.OneMandatoryToOneOptional]: { start: 'to-1-mandatory.svg', end: 'to-1-optional.svg' },
    [ConnectionType.OneMandatoryToManyMandatory]: { start: 'to-1-mandatory.svg', end: 'to-many-mandatory.svg' },
    [ConnectionType.OneMandatoryToManyOptional]: { start: 'to-1-mandatory.svg', end: 'to-many-optional.svg' },
    [ConnectionType.OneMandatory]: { start: DOT, end: 'to-1-mandatory.svg' },
    [ConnectionType.OneOptionalToManyMandatory]: { start: 'to-1-optional.svg', end: 'to-many-mandatory.svg' },
    [ConnectionType.OneOptionalToManyOptional]: { start: 'to-1-optional.svg', end: 'to-many-optional.svg' },
    [ConnectionType.OneToOne]: { start: 'to-1-mandatory.svg', end: 'to-1-mandatory.svg' },
    [ConnectionType.OneToMany]: { start: DOT, end: 'to-many-mandatory.svg' },
    [ConnectionType.One]: { start: DOT, end: 'to-1.svg' },
    [ConnectionType.ManyMandatoryToManyMandatory]: { start: 'to-many-mandatory.svg', end: 'to-many-mandatory.svg' },
    [ConnectionType.ManyOptionalToManyMandatory]: { start: 'to-many-optional.svg', end: 'to-many-mandatory.svg' },
    [ConnectionType.ManyOptionalToManyOptional]: { start: 'to-many-optional.svg', end: 'to-many-optional.svg' },
    [ConnectionType.ManyToMany]: { start: 'to-many.svg', end: 'to-many.svg' },
    [ConnectionType.Many]: { start: DOT, end: 'to-many.svg' }
};

export function getEndpointImagePath(imageName: string): string {
    if (!imageName) {
        return '';  // Return empty for dot/circle
    }
    return `src/assets/diagram-elements/Connections/${imageName}`;
}

export function getConnectionTypeFromPath(path: string): ConnectionType {
    const filename = path.split('/').pop() || '';
    const type = filename.replace('.svg', '') as ConnectionType;

    if (Object.values(ConnectionType).includes(type)) {
        return type;
    }
    return ConnectionType.Default;
}