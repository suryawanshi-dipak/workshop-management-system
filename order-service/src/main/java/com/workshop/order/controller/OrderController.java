package com.workshop.order.controller;

import com.workshop.order.entity.Order;
import com.workshop.order.service.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    // CREATE / UPDATE ORDER
    @PostMapping
    public Order saveOrder(@RequestBody Order order) {
        return service.saveOrder(order);
    }

    // 🔍 SEARCH ORDER  (🔥 FIXED 🔥)
    @GetMapping("/search")
    public Order searchOrder(
            @RequestParam(name = "orderNumber", required = false) String orderNumber,
            @RequestParam(name = "license", required = false) String license) {

        return service.searchOrder(orderNumber, license)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    // ➕ CREATE NEW ORDER
    @GetMapping("/new")
    public Order createNewOrder() {
        return service.createNewOrder();
    }
}
