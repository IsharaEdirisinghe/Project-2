import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import axios from "axios";
import nodemailer from "nodemailer";
import Product from "../models/product.js";

dotenv.config();

export function createUser(req, res) {
    if (req.body.role == "admin") {
        if (req.user == null) {
            return res.status(403).json({
                message: "Please login first"
            })
        }
        if (req.user.role != "admin") {
            return res.status(403).json({
                message: "Not authorized"
            })
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role,
    })

    user
        .save()
        .then(() => {
            res.json({
                message: "User added succefully"
            });
        })
        // .catch(()=>{
        //     res.json({
        //         message: "Failed to add user"
        //     });
        // })
        .catch((error) => {
            console.error(error);
            res.status(500).json({
                message: "Failed to add user",
                error: error.message
            });
        });

}

export function loginUser(req, res) {
    const email = req.body.email
    const password = req.body.password

    User.findOne({ email: email }).then(
        (user) => {
            if (user == null) {
                res.status(404).json({
                    message: "User not found"
                })
            } else {
                const isPasswordCorrect = bcrypt.compareSync(password, user.password)
                if (isPasswordCorrect) {
                    const token = jwt.sign({
                        _id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        img: user.img
                    },
                        process.env.JWT_KEY
                    )


                    res.json({
                        message: "Login successful",
                        token: token,
                        role: user.role
                    })
                } else {
                    res.status(401).json({
                        message: "Invalid password"
                    })
                }
            }
        }
    )
}

export async function loginWithGoogle(req, res) {
    const token = req.body.accessToken;
    if (token == null) {
        res.status(400).json({
            message: "Access token is required"
        });
        return
    }
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    console.log(response.data);

    const user = await User.findOne({
        email: response.data.email
    })

    if (user == null) {
        const newUser = new User({
            email: response.data.email,
            firstName: response.data.given_name,
            lastName: response.data.family_name,
            password: "googleUser",
            img: response.data.picture
        })
        await newUser.save();
        const token = jwt.sign(
            {
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                img: newUser.img
            },
            process.env.JWT_KEY
        )
        res.json({
            message: "Login successful",
            token: token,
            role: newUser.role
        })
    } else {
        const token = jwt.sign(
            {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                img: user.img
            },
            process.env.JWT_KEY
        )
        res.json({
            message: "Login successful",
            token: token,
            role: user.role
        })
    }
}

const transport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: "isharaedirisinghe800@gmail.com",
        pass: "lxpcujhmkbyceday"
    }
})

export async function sendOTP(req, res) {
    const randomOTP = Math.floor(100000 + Math.random() * 900000);
    const email = req.body.email;
    if (email == null) {
        res.status(400).json({
            message: "Email is required"
        });
        return;
    }

    const user = await User.findOne({
        email: email
    })

    if (user == null) {
        res.status(404).json({
            message: "User not found"
        })
    }

    await OTP.deleteMany({
        email: email
    })

    const message = {
        from: "isharaedirisinghe800@gmail.com",
        to: email,
        subject: "Resetting password for crystal beauty clear",
        text: "This your password reset OTP : " + randomOTP
    }

    const otp = new OTP({
        email: email,
        otp: randomOTP
    })
    await otp.save()

    transport.sendMail(message, (error, info) => {
        if (error) {
            res.status(500).json({
                message: "Failed to send OTP",
                error: error
            });
        } else {
            res.json({
                message: "OTP sent successfully",
                otp: randomOTP
            });
        }
    })
}

export async function changePassword(req, res) {

    try {

        const user = await User.findOne({

            email: req.user.email

        })

        const isCorrect = bcrypt.compareSync(

            req.body.currentPassword,

            user.password

        )

        if (!isCorrect) {

            return res.status(400).json({

                message: "Current password is incorrect"

            })

        }

        const hashedPassword = bcrypt.hashSync(

            req.body.newPassword,

            10

        )

        user.password = hashedPassword

        await user.save()

        res.json({

            message: "Password Changed Successfully"

        })

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        })

    }

}

export async function getProfile(req, res) {

    try {

        const user = await User.findOne({

            email: req.user.email

        }).select("-password")

        if (!user) {

            return res.status(404).json({

                message: "User not found"

            })

        }

        res.status(200).json(user)

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

}

export async function updateProfile(req, res) {
    try {

        const user = await User.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (req.body.firstName !== undefined) {
            user.firstName = req.body.firstName;
        }

        if (req.body.lastName !== undefined) {
            user.lastName = req.body.lastName;
        }

        if (req.body.phone !== undefined) {
            user.phone = req.body.phone;
        }

        if (req.body.address !== undefined) {
            user.address = req.body.address;
        }

        if (req.body.city !== undefined) {
            user.city = req.body.city;
        }

        if (req.body.country !== undefined) {
            user.country = req.body.country;
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                city: user.city,
                country: user.country,
                img: user.img
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

export async function getWishlist(req, res) {
    try {
        const user = await User.findOne({
            email: req.user.email
        })
            .select("wishlist")
            .populate("wishlist");

        if (!user) {

            console.log("WISHLIST USER NOT FOUND:", req.user);
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            wishlist: user.wishlist
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}


export async function addToWishlist(req, res) {
    try {
        const productId = req.params.productId;

        const user = await User.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check whether product is already in wishlist
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({
                message: "Product already in wishlist"
            });
        }

        user.wishlist.push(productId);

        await user.save();

        res.status(200).json({
            message: "Product added to wishlist",
            wishlist: user.wishlist
        });

    } catch (err) {

        console.error("Add wishlist error:", err);
        res.status(500).json({
            message: err.message
        });
    }
}


export async function removeFromWishlist(req, res) {
    try {
        const productId = req.params.productId;

        const user = await User.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.wishlist = user.wishlist.filter(
            id => id.toString() !== productId
        );

        await user.save();

        res.status(200).json({
            message: "Product removed from wishlist",
            wishlist: user.wishlist
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

export async function getAddresses(req, res) {

    try {

        console.log("GET ADDRESSES CALLED");
        console.log("USER:", req.user);

        const user = await User.findOne({
            email: req.user.email
        }).select("addresses");

        console.log("FOUND USER:", user);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            addresses: user.addresses || []
        });

    } catch (error) {

        console.error("GET ADDRESSES ERROR:", error);

        res.status(500).json({
            message: error.message
        });

    }
}

export async function addAddress(req, res) {
    try {

        const user = await User.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const newAddress = {
            fullName: req.body.fullName,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postalCode,
            country: req.body.country || "Sri Lanka",
            isDefault: req.body.isDefault || false
        };

        // If this is the first address, make it default
        if (user.addresses.length === 0) {
            newAddress.isDefault = true;
        }

        // If new address is default, remove default from other addresses
        if (newAddress.isDefault) {
            user.addresses.forEach(address => {
                address.isDefault = false;
            });
        }

        user.addresses.push(newAddress);

        await user.save();

        res.status(201).json({
            message: "Address added successfully",
            addresses: user.addresses
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

export async function updateAddress(req, res) {
    try {

        const user = await User.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const address = user.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        address.fullName = req.body.fullName;
        address.phone = req.body.phone;
        address.address = req.body.address;
        address.city = req.body.city;
        address.postalCode = req.body.postalCode;
        address.country = req.body.country || "Sri Lanka";

        if (req.body.isDefault === true) {

            user.addresses.forEach(item => {
                item.isDefault = false;
            });

            address.isDefault = true;
        }

        await user.save();

        res.status(200).json({
            message: "Address updated successfully",
            addresses: user.addresses
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

export async function deleteAddress(req, res) {
    try {

        const user = await User.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const address = user.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        const wasDefault = address.isDefault;

        address.deleteOne();

        // If deleted address was default,
        // make the first remaining address default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.status(200).json({
            message: "Address deleted successfully",
            addresses: user.addresses
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

// Get user's cart
export async function getCart(req, res) {
    try {
        const user = await User.findOne({
            email: req.user.email
        })
            .select("cart")
            .populate("cart.product");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            cart: user.cart || []
        });

    } catch (error) {
        console.error("Get cart error:", error);

        res.status(500).json({
            message: error.message
        });
    }
}


// Add product to cart
export async function addToCart(req, res) {
    try {
        const productId = req.params.productId;
        const { size, color } = req.body;

        // Size and color are required
        if (!size || !color) {
            return res.status(400).json({
                message: "Size and color are required"
            });
        }

        const user = await User.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Check whether selected variant exists
        const variant = product.variants.find(
            v =>
                v.size === size &&
                v.color === color
        );

        if (!variant) {
            return res.status(400).json({
                message: "Selected size and color combination is not available"
            });
        }

        // Check stock
        if (variant.stock < 1) {
            return res.status(400).json({
                message: "Selected variant is out of stock"
            });
        }

        // Check same product + same size + same color
        const existingItem = user.cart.find(
            item =>
                item.product.toString() === productId &&
                item.size === size &&
                item.color === color
        );

        if (existingItem) {

            if (existingItem.quantity >= variant.stock) {
                return res.status(400).json({
                    message: "Maximum available stock reached"
                });
            }

            existingItem.quantity += 1;

        } else {

            user.cart.push({
                product: productId,
                quantity: 1,
                size: size,
                color: color
            });
        }

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("cart")
            .populate("cart.product");

        res.status(200).json({
            message: "Product added to cart",
            cart: updatedUser.cart
        });

    } catch (error) {
        console.error("Add cart error:", error);

        res.status(500).json({
            message: error.message
        });
    }
}


// Update cart quantity
export async function updateCartQuantity(req, res) {
    try {
        const productId = req.params.productId;
        const { quantity, size, color } = req.body;

        const newQuantity = Number(quantity);

        if (!size || !color) {
            return res.status(400).json({
                message: "Size and color are required"
            });
        }

        if (newQuantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1"
            });
        }

        const user = await User.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const variant = product.variants.find(
            v =>
                v.size === size &&
                v.color === color
        );

        if (!variant) {
            return res.status(400).json({
                message: "Selected variant is not available"
            });
        }

        if (newQuantity > variant.stock) {
            return res.status(400).json({
                message: `Only ${variant.stock} items available`
            });
        }

        const cartItem = user.cart.find(
            item =>
                item.product.toString() === productId &&
                item.size === size &&
                item.color === color
        );

        if (!cartItem) {
            return res.status(404).json({
                message: "Product variant not found in cart"
            });
        }

        cartItem.quantity = newQuantity;

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("cart")
            .populate("cart.product");

        res.status(200).json({
            message: "Cart updated",
            cart: updatedUser.cart
        });

    } catch (error) {
        console.error("Update cart error:", error);

        res.status(500).json({
            message: error.message
        });
    }
}


// Remove product from cart
export async function removeFromCart(req, res) {
    try {
        const productId = req.params.productId;
        const { size, color } = req.body;

        if (!size || !color) {
            return res.status(400).json({
                message: "Size and color are required"
            });
        }

        const user = await User.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const itemExists = user.cart.some(
            item =>
                item.product.toString() === productId &&
                item.size === size &&
                item.color === color
        );

        if (!itemExists) {
            return res.status(404).json({
                message: "Product variant not found in cart"
            });
        }

        user.cart = user.cart.filter(
            item =>
                !(
                    item.product.toString() === productId &&
                    item.size === size &&
                    item.color === color
                )
        );

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("cart")
            .populate("cart.product");

        res.status(200).json({
            message: "Product removed from cart",
            cart: updatedUser.cart
        });

    } catch (error) {
        console.error("Remove cart error:", error);

        res.status(500).json({
            message: error.message
        });
    }
}

export async function clearInvalidCartItems(req, res) {
    try {
        const user = await User.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.cart = user.cart.filter(
            item => item.product && item.size && item.color
        );

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("cart")
            .populate("cart.product");

        res.status(200).json({
            message: "Invalid cart items removed",
            cart: updatedUser.cart
        });

    } catch (error) {
        console.error("Clear invalid cart error:", error);

        res.status(500).json({
            message: error.message
        });
    }
}

export function isAdmin(req) {
    if (req.user == null) {
        return false
    }

    if (req.user.role != "admin") {
        return false
    }
    return true
}
