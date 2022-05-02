Stop Loss is really tricky.

When you create a stop loss order, you are given two ids:
- `order_id`
- `order_id_str`

Their values are different! (regardless of their type)

When a stop loss order hits it's target price, it's automatically cancelled.
Instead, there's created an order to close your position. 
It has a `client_order_id` equal to `order_id` given before.

But if you want to cancel a stop loss order, you have to use `order_id_str`.

This is the reason I keep both of them.