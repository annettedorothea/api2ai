import { describe, expect, test } from 'vitest';
import {
    buildParamWireMaps,
    isValidMcpParamName,
    sanitizeWireParamNamesInText,
    toMcpParamName
} from '../src/mcp-param-names.js';

describe('mcp-param-names', () => {
    test('isValidMcpParamName rejects dots and leading digits', () => {
        expect(isValidMcpParamName('page')).toBe(true);
        expect(isValidMcpParamName('with_genres')).toBe(true);
        expect(isValidMcpParamName('vote_average.gte')).toBe(false);
        expect(isValidMcpParamName('1based')).toBe(false);
    });

    test('toMcpParamName maps dots to underscores', () => {
        expect(toMcpParamName('page')).toBe('page');
        expect(toMcpParamName('vote_average.gte')).toBe('vote_average_gte');
        expect(toMcpParamName('primary_release_date.lte')).toBe('primary_release_date_lte');
    });

    test('buildParamWireMaps returns only differing entries in mcpToWire', () => {
        const maps = buildParamWireMaps(['page', 'vote_average.gte', 'vote_average.lte']);
        expect(maps.wireToMcp).toEqual({
            page: 'page',
            'vote_average.gte': 'vote_average_gte',
            'vote_average.lte': 'vote_average_lte'
        });
        expect(maps.mcpToWire).toEqual({
            vote_average_gte: 'vote_average.gte',
            vote_average_lte: 'vote_average.lte'
        });
    });

    test('buildParamWireMaps throws on collision', () => {
        expect(() => buildParamWireMaps(['a.b', 'a_b'])).toThrow(/collision/i);
    });

    test('sanitizeWireParamNamesInText replaces dotted wire names in prose', () => {
        const { wireToMcp } = buildParamWireMaps(['vote_average.gte', 'certification.lte', 'page']);
        const text = 'use with `certification`, `certification.gte` and `certification.lte`; filter vote_average.gte';
        expect(sanitizeWireParamNamesInText(text, wireToMcp)).toBe(
            'use with `certification`, `certification_gte` and `certification_lte`; filter vote_average_gte'
        );
        expect(sanitizeWireParamNamesInText('sort_by vote_average.desc', wireToMcp)).toBe('sort_by vote_average.desc');
    });
});
