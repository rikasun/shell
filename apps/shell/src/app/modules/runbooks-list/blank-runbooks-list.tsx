import { Button } from '@cased/ui';

export function BlankRunbooksList() {
  return (
    <div className="grid grid-cols-2 gap-12">
      <div className="flex flex-col justify-center space-y-4">
        <h3>Runbooks automate multi-step workflows</h3>
        <p className="text-xl text-zinc-700">
          A runbook turns complex, multi-step workflows across different tools
          and applications into a single, easy to use tool.
        </p>
        <h4>Powerful tools, easy to use</h4>
        <ul className="list-disc space-y-1 px-4">
          <li>Accept user input</li>
          <li>Integrate with any REST API</li>
          <li>
            Run shell commands, use databases, and get data from interactive
            prompts
          </li>
          <li>Reviews and approvals built in</li>
          <li>Bring it all together into a simple, reusable tool</li>
        </ul>
      </div>
      <div>
        <div className="space-y-4 rounded border border-zinc-100 bg-white p-6 shadow-xl">
          <strong className="font-medium">Permanently delete user</strong>
          <div className="rounded-sm border border-zinc-200 p-4">
            <label className="mb-1 block" htmlFor="username">
              User email or ID
            </label>
            <input type="text" id="username" className="w-full" />
          </div>
          <div className="rounded-sm border border-zinc-200 p-4">
            <div className="flex items-center justify-between font-medium">
              Remove from Stripe
              <div className="flex rounded">
                <span className="rounded-tl rounded-bl border border-zinc-700 bg-zinc-700 px-2 py-1 text-sm text-white">
                  REST
                </span>
                <span className="rounded-tr rounded-br border border-zinc-700 bg-gray-100 px-2 py-1 text-sm text-red-600">
                  DELETE
                </span>
              </div>
            </div>
            <div className="mt-2 truncate text-ellipsis font-mono text-sm">
              api.stripe.com/v1/customers/{'{'} CUSTOMER {'}'}
            </div>
          </div>
          <div className="rounded-sm border border-zinc-200 p-4">
            <div className="flex items-center justify-between font-medium">
              Remove from Mailchimp
              <div className="flex rounded">
                <span className="rounded-tl rounded-bl border border-zinc-700 bg-zinc-700 px-2 py-1 text-sm text-white">
                  REST
                </span>
                <span className="rounded-tr rounded-br border border-zinc-700 bg-gray-100 px-2 py-1 text-sm text-red-600">
                  DELETE
                </span>
              </div>
            </div>
            <div className="mt-2 truncate text-ellipsis font-mono text-sm">
              api.mailchimp.com/3.0/lists/03993/members/{'{'} CUSTOMER {'}'}
            </div>
          </div>
          <div className="rounded-sm border border-zinc-200 p-4">
            <div className="flex items-center justify-between font-medium">
              Delete from Database
              <div className="flex rounded">
                <span className="rounded border border-zinc-700 bg-purple-700 px-2 py-1 text-sm text-white">
                  SQL
                </span>
              </div>
            </div>
            <div className="mt-2 truncate text-ellipsis text-sm font-medium">
              <Button display="primary">View query</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlankRunbooksList;
