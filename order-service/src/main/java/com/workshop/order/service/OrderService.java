package com.workshop.order.service;

import com.workshop.order.dto.CreateOrderRequest;
import com.workshop.order.dto.OrderActivityRequest;
import com.workshop.order.dto.OrderPartRequest;
import com.workshop.order.entity.Order;
import com.workshop.order.entity.OrderActivityLine;
import com.workshop.order.entity.OrderPart;
import com.workshop.order.repository.OrderRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    // ✅ GET ALL
    public List<Order> getAllOrders() {
        return repository.findAll();
    }

    // ✅ DELETE
    public void deleteOrder(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Order not found: " + id);
        }
        repository.deleteById(id);
    }

    // ✅ GET BY ID
    public Order getOrderById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }

    // ✅ SEARCH
    public Optional<Order> searchOrder(String orderNumber, String license) {
        if (orderNumber != null && !orderNumber.isEmpty()) {
            return repository.findByOrderNumber(orderNumber);
        }
        if (license != null && !license.isEmpty()) {
            return repository.findByLicense(license);
        }
        return Optional.empty();
    }

    // ✅ NEW ORDER PREVIEW
    public Order createNewOrder() {
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        return order;
    }

    // ✅ CREATE / UPDATE (React frontend flow)
    public Order saveOrder(Order order) {

        if (order.getId() == null) {
            order.setOrderNumber(generateOrderNumber());
            if (order.getCreatedAt() == null) {
                order.setCreatedAt(LocalDate.now());
            }
        } else {
            Order existing = repository.findById(order.getId())
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            order.setOrderNumber(existing.getOrderNumber());
            if (order.getCreatedAt() == null) {
                order.setCreatedAt(existing.getCreatedAt());
            }
        }

        // ✅ Fix back-references so cascade writes children correctly
        if (order.getParts() != null) {
            order.getParts().forEach(p -> p.setOrder(order));
        }

        if (order.getActivityLines() != null) {
            order.getActivityLines().forEach(a -> a.setOrder(order));
        }

        return repository.save(order);
    }

    // ⚠️ IMPROVED (still simple, not perfect for concurrency)
    private String generateOrderNumber() {
        long count = repository.count() + 1;
        int year = Year.now().getValue();
        return "ORD-" + year + "-" + String.format("%04d", count);
    }

    // ✅ CREATE FROM PLANNING
    public Order createOrderFromPlanning(CreateOrderRequest request) {

        Order ord = new Order();
        ord.setOrderNumber(generateOrderNumber());
        ord.setCreatedAt(LocalDate.now());
        ord.setStatus("Scheduled");

        // Planning-flow fields
        ord.setLicense(request.getLicense());
        ord.setCustomerName(request.getCustomerName());
        ord.setCustomerNumber(request.getCustomerNumber());
        ord.setCarMileage(request.getCarMileage());
        ord.setCarMake(request.getCarMake());

        // React frontend fields (present when called from Planning "Create Order")
        ord.setCustomerId(request.getCustomerId());
        ord.setCarId(request.getCarId());
        ord.setServiceType(request.getServiceType());
        ord.setNotes(request.getNotes());
        ord.setPrice(request.getPrice());

        // ✅ Map parts — was missing part.setUnit()
        if (request.getParts() != null && !request.getParts().isEmpty()) {
            List<OrderPart> parts = new ArrayList<>();
            for (OrderPartRequest p : request.getParts()) {
                OrderPart part = new OrderPart();
                part.setPartNumber(p.getPartNo());
                part.setDescription(p.getDescription());
                part.setQuantity(p.getQuantity());
                part.setUnit(p.getUnit());                           // ← was missing
                part.setUnitPrice(
                        p.getUnitPrice() != null
                                ? new java.math.BigDecimal(p.getUnitPrice().toString())
                                : null
                );
                part.setOrder(ord);                                  // ← back-reference
                parts.add(part);
            }
            ord.setParts(parts);
        }

        // ✅ Map activity lines — was completely missing
        if (request.getActivities() != null && !request.getActivities().isEmpty()) {
            List<OrderActivityLine> activities = new ArrayList<>();
            for (OrderActivityRequest a : request.getActivities()) {
                OrderActivityLine line = new OrderActivityLine();
                line.setActivityCode(a.getActivityCode());
                line.setDescription(a.getDescription());
                line.setHours(a.getHours());
                line.setHourlyRate(a.getHourlyRate());
                line.setOrder(ord);                                  // ← back-reference
                activities.add(line);
            }
            ord.setActivityLines(activities);
        }

        return repository.save(ord);
    }
}