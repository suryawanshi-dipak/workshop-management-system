package com.workshop.planning.controller;

import com.workshop.planning.entity.Planning;
import com.workshop.planning.service.PlanningService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


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
    /*
    @PostMapping("/{id}/create-order")
    public Planning createOrder(@PathVariable Long id) {
        return planningService.createOrderFromPlanning(id);
    }
        */
}
