package com.workshop.planning.controller;

import com.workshop.planning.dto.CreateOrderResponseDTO;
import com.workshop.planning.entity.Planning;
import com.workshop.planning.service.PlanningService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("api/plannings")
@CrossOrigin
public class PlanningController {

    private final PlanningService planningService;

    public PlanningController(PlanningService planningService) {
        this.planningService = planningService;
    }

    @GetMapping("/getPlanning")
    public Planning getMethodName(@RequestParam("Planning_ID") Long id) {
        Planning p = planningService.getPlanning(id);
        return p;
    }
    

    @PostMapping
    public Planning createPlanning(@RequestBody Planning planning) {
        return planningService.createPlanning(planning);
    }

    @PostMapping("/{id}/create-order")
    public CreateOrderResponseDTO createOrder(@PathVariable("id") Long id) {
System.out.println("/{id}/create-order called");        
        return planningService.createOrderFromPlanning(id);
    }
}
