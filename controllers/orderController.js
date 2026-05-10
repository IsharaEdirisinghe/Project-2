import Order from "../models/order.js"

export async function createOrder(req, res) {
    //get user information
    if (req.user == null) {
        res.status(403).json({
            message: "Please login and try again"
        })
        return
    }

    const orderInfo = req.body

    if (orderInfo.name == null) {
        orderInfo.name = req.user.firstName + " " + req.user.lastName
    }

    let orderId = "CBC00001"

    const lastOrder = await Order.find().sort({ date: -1 }).limit(1)

    if (lastOrder.length > 0) {
        const lastOrderId = lastOrder[0].orderId

        const lastOrderNumberString = lastOrderId.replace("CBC", "")
        const lastOrderNumber = parseInt(lastOrderNumberString)
        const newOrderNumber = lastOrderNumber + 1
        const newOrderNumberString = String(newOrderNumber).padStart(5, '0');
        orderId = "CBC" + newOrderNumberString
    }


    try {

        const order = new Order({
            orderId: orderId,
            email: req.user.email,
            name: orderInfo.name,
            address: orderInfo.address,
            total: 0,
            phone: orderInfo.phone,
            products: []
        })
        const createOrder = await order.save()
        res.json({
            message: "Order created successfully",
            order: createOrder
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to create order",
            error: err
        })
    }




    //add current users name if not provided
    //orderId generate
    //create order object

}