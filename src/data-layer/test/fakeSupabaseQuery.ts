// A lightweight, in-memory stand-in for the chainable postgrest-js query
// builder (`SupabaseClient.from(table).select(...).eq(...)...`), used to unit
// test SupabaseBookQueryBuilder / SupabaseBookRepository without a network
// call or a running Supabase stack.
//
// Every chain method (.select/.eq/.ilike/.in/.or/.contains/.overlaps/.not/
// .like/.neq/.filter/.order/.range/.maybeSingle) just records its name and
// arguments onto `calls` and returns `this`, mirroring postgrest-js's
// mutate-and-return-same-builder convention. Awaiting the query (`await q`,
// or vitest awaiting a `{ query }` wrapper's `.query`) resolves via the
// supplied resolver function, keyed on the table name and the calls made so
// far -- this lets tests distinguish e.g. the outer `books` query from an
// inner `id`-only sub-query used by anyOfThese/derivedFrom.
export interface RecordedCall {
    method: string;
    args: unknown[];
}

export interface FakeQueryResult {
    data?: unknown[] | unknown | null;
    error?: unknown;
    count?: number | null;
}

export type FakeQueryResolver = (
    table: string,
    calls: RecordedCall[]
) => FakeQueryResult;

const defaultResolver: FakeQueryResolver = () => ({
    data: [],
    error: null,
    count: 0,
});

// Mutate-and-return-same-builder is exactly what postgrest-js does, and
// SupabaseBookQueryBuilder relies on being able to reassign `q = q.eq(...)`
// et al.; a thenable so top-level `await q` and `await client.from(...)...`
// both work without a `.then()`-triggering-early-execution footgun (see the
// comment on BookFilterResult in SupabaseBookQueryBuilder.ts).
export class FakeQuery implements PromiseLike<FakeQueryResult> {
    public readonly calls: RecordedCall[] = [];

    constructor(
        public readonly table: string,
        private readonly resolver: FakeQueryResolver
    ) {}

    private push(method: string, args: unknown[]): this {
        this.calls.push({ method, args });
        return this;
    }

    select(...args: unknown[]): this {
        return this.push("select", args);
    }
    eq(...args: unknown[]): this {
        return this.push("eq", args);
    }
    neq(...args: unknown[]): this {
        return this.push("neq", args);
    }
    ilike(...args: unknown[]): this {
        return this.push("ilike", args);
    }
    like(...args: unknown[]): this {
        return this.push("like", args);
    }
    in(...args: unknown[]): this {
        return this.push("in", args);
    }
    or(...args: unknown[]): this {
        return this.push("or", args);
    }
    contains(...args: unknown[]): this {
        return this.push("contains", args);
    }
    overlaps(...args: unknown[]): this {
        return this.push("overlaps", args);
    }
    not(...args: unknown[]): this {
        return this.push("not", args);
    }
    filter(...args: unknown[]): this {
        return this.push("filter", args);
    }
    order(...args: unknown[]): this {
        return this.push("order", args);
    }
    range(...args: unknown[]): this {
        return this.push("range", args);
    }
    maybeSingle(...args: unknown[]): this {
        return this.push("maybeSingle", args);
    }

    then<TResult1 = FakeQueryResult, TResult2 = never>(
        onfulfilled?:
            | ((value: FakeQueryResult) => TResult1 | PromiseLike<TResult1>)
            | null,
        onrejected?:
            | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
            | null
    ): PromiseLike<TResult1 | TResult2> {
        const result = this.resolver(this.table, this.calls.slice());
        return Promise.resolve(result).then(onfulfilled, onrejected);
    }

    // Convenience for assertions: the sequence of (method, firstArg) pairs,
    // which is usually all a test needs to check.
    callSummary(): Array<[string, ...unknown[]]> {
        return this.calls.map((c) => [c.method, ...c.args]);
    }
}

// Minimal stand-in for SupabaseClient. Cast to `SupabaseClient` at call
// sites (the query builder module only uses `.from()`, typed loosely as
// `SupabaseQuery = any` internally -- see SupabaseBookQueryBuilder.ts).
export class FakeSupabaseClient {
    public readonly queries: FakeQuery[] = [];

    constructor(
        private readonly resolver: FakeQueryResolver = defaultResolver
    ) {}

    from(table: string): FakeQuery {
        const q = new FakeQuery(table, this.resolver);
        this.queries.push(q);
        return q;
    }

    // All queries issued against a given table, in call order.
    queriesFor(table: string): FakeQuery[] {
        return this.queries.filter((q) => q.table === table);
    }
}
