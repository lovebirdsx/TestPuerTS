/// <reference path="puerts.d.ts" />
declare module "ue" {
    import {$Ref, $Nullable} from "puerts"

    import * as cpp from "cpp"

    import * as UE from "ue"

// __TYPE_DECL_START: 486257D6480B53C2CBB9CABD5C179448
    namespace Game.Common.ThirdPerson.Blueprints.BP_ThirdPersonCharacter {
        class BP_ThirdPersonCharacter_C extends UE.Character {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            FollowCamera: UE.CameraComponent;
            CameraBoom: UE.SpringArmComponent;
            ExecuteUbergraph_BP_ThirdPersonCharacter(EntryPoint: number) : void;
            InpActEvt_IA_Jump_K2Node_EnhancedInputActionEvent_2(ActionValue: UE.InputActionValue, ElapsedTime: number, TriggeredTime: number, SourceAction: $Nullable<UE.InputAction>) : void;
            InpActEvt_IA_Jump_K2Node_EnhancedInputActionEvent_3(ActionValue: UE.InputActionValue, ElapsedTime: number, TriggeredTime: number, SourceAction: $Nullable<UE.InputAction>) : void;
            InpActEvt_IA_Look_K2Node_EnhancedInputActionEvent_0(ActionValue: UE.InputActionValue, ElapsedTime: number, TriggeredTime: number, SourceAction: $Nullable<UE.InputAction>) : void;
            InpActEvt_IA_Move_K2Node_EnhancedInputActionEvent_1(ActionValue: UE.InputActionValue, ElapsedTime: number, TriggeredTime: number, SourceAction: $Nullable<UE.InputAction>) : void;
            /*
             *Event called after a pawn's controller has changed, on the server and owning client. This will happen at the same time as the delegate on GameInstance
             */
            ReceiveControllerChanged(OldController: $Nullable<UE.Controller>, NewController: $Nullable<UE.Controller>) : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_ThirdPersonCharacter_C;
            static Load(InName: string): BP_ThirdPersonCharacter_C;
        
            __tid_BP_ThirdPersonCharacter_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: D52823D34CCE3F63F0A77986ABB3351E
    namespace Game.Common.ThirdPerson.Blueprints.BP_ThirdPersonGameMode {
        class BP_ThirdPersonGameMode_C extends UE.GameModeBase {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            DefaultSceneRoot: UE.SceneComponent;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_ThirdPersonGameMode_C;
            static Load(InName: string): BP_ThirdPersonGameMode_C;
        
            __tid_BP_ThirdPersonGameMode_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 741A062341B65D2676DB2EB54D62F3AB
    namespace Game.Common.ThirdPerson.Blueprints.ABP_Mannequin {
        class AnimBlueprintGeneratedMutableData extends UE.AnimBlueprintMutableData {
            constructor();
            constructor(__FloatProperty: number);
            __FloatProperty: number;
            /**
             * @deprecated use StaticStruct instead.
             */
            static StaticClass(): ScriptStruct;
            static StaticStruct(): ScriptStruct;
            __tid_AnimBlueprintGeneratedMutableData_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 741A062341B65D2676DB2EB54D62F3AB
    namespace Game.Common.ThirdPerson.Blueprints.ABP_Mannequin {
        class ABP_Mannequin_C extends UE.AnimInstance {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            __AnimBlueprintMutables: UE.Game.Common.ThirdPerson.Blueprints.ABP_Mannequin.AnimBlueprintGeneratedMutableData;
            AnimBlueprintExtension_PropertyAccess: UE.AnimSubsystemInstance;
            AnimBlueprintExtension_Base: UE.AnimSubsystemInstance;
            AnimGraphNode_Root: UE.AnimNode_Root;
            AnimGraphNode_TransitionResult_7: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_6: UE.AnimNode_TransitionResult;
            AnimGraphNode_BlendSpacePlayer: UE.AnimNode_BlendSpacePlayer;
            AnimGraphNode_StateResult_5: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer_3: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_4: UE.AnimNode_StateResult;
            AnimGraphNode_StateMachine_1: UE.AnimNode_StateMachine;
            AnimGraphNode_SaveCachedPose: UE.AnimNode_SaveCachedPose;
            AnimGraphNode_TransitionResult_5: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_4: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_3: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_2: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_1: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult: UE.AnimNode_TransitionResult;
            AnimGraphNode_ApplyAdditive: UE.AnimNode_ApplyAdditive;
            AnimGraphNode_UseCachedPose_1: UE.AnimNode_UseCachedPose;
            AnimGraphNode_SequencePlayer_2: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_3: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer_1: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_2: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_1: UE.AnimNode_StateResult;
            AnimGraphNode_UseCachedPose: UE.AnimNode_UseCachedPose;
            AnimGraphNode_StateResult: UE.AnimNode_StateResult;
            AnimGraphNode_StateMachine: UE.AnimNode_StateMachine;
            Velocity: UE.Vector;
            GroundSpeed: number;
            ShouldMove: boolean;
            IsFalling: boolean;
            Character: UE.Character;
            MovementComponent: UE.CharacterMovementComponent;
            AnimGraph(AnimGraph: $Ref<UE.PoseLink>) : void;
            /*
             *Executed when the Animation is initialized
             */
            BlueprintInitializeAnimation() : void;
            /*
             *Executed when the Animation is updated
             */
            BlueprintUpdateAnimation(DeltaTimeX: number) : void;
            EvaluateGraphExposedInputs_ExecuteUbergraph_ABP_Mannequin_AnimGraphNode_TransitionResult_1449A056427E3327ECA49CB21EF16E93() : void;
            ExecuteUbergraph_ABP_Mannequin(EntryPoint: number) : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): ABP_Mannequin_C;
            static Load(InName: string): ABP_Mannequin_C;
        
            __tid_ABP_Mannequin_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 741A062341B65D2676DB2EB54D62F3AB
    namespace Game.Common.ThirdPerson.Blueprints.ABP_Mannequin {
        class AnimBlueprintGeneratedConstantData extends UE.AnimBlueprintConstantData {
            constructor();
            constructor(__NameProperty_148: string, __NameProperty_149: string, __NameProperty_150: string, __NameProperty_151: string, __IntProperty_152: number, __FloatProperty_153: number, __NameProperty_154: string, __IntProperty_155: number, __BoolProperty_156: boolean, __FloatProperty_157: number, __StructProperty_158: UE.InputScaleBiasClampConstants, __FloatProperty_159: number, __BoolProperty_160: boolean, __EnumProperty_161: UE.EAnimSyncMethod, __ByteProperty_162: UE.EAnimGroupRole, __NameProperty_163: string, __NameProperty_164: string, __IntProperty_165: number, __NameProperty_166: string, __NameProperty_167: string, __IntProperty_168: number, __StructProperty_169: UE.AnimNodeFunctionRef, AnimBlueprintExtension_PropertyAccess: UE.AnimSubsystem_PropertyAccess, AnimBlueprintExtension_Base: UE.AnimSubsystem_Base, AnimGraphNode_Root: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_TransitionResult_7: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_TransitionResult_6: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_BlendSpacePlayer: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_StateResult_5: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_SequencePlayer_3: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_StateResult_4: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_StateMachine_1: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_SaveCachedPose: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_TransitionResult_5: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_TransitionResult_4: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_TransitionResult_3: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_TransitionResult_2: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_TransitionResult_1: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_TransitionResult: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_ApplyAdditive: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_UseCachedPose_1: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_SequencePlayer_2: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_StateResult_3: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_SequencePlayer_1: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_StateResult_2: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_SequencePlayer: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_StateResult_1: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_UseCachedPose: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_StateResult: UE.AnimNodeExposedValueHandler_PropertyAccess, AnimGraphNode_StateMachine: UE.AnimNodeExposedValueHandler_PropertyAccess);
            __NameProperty_148: string;
            __NameProperty_149: string;
            __NameProperty_150: string;
            __NameProperty_151: string;
            __IntProperty_152: number;
            __FloatProperty_153: number;
            __NameProperty_154: string;
            __IntProperty_155: number;
            __BoolProperty_156: boolean;
            __FloatProperty_157: number;
            __StructProperty_158: UE.InputScaleBiasClampConstants;
            __FloatProperty_159: number;
            __BoolProperty_160: boolean;
            __EnumProperty_161: UE.EAnimSyncMethod;
            __ByteProperty_162: UE.EAnimGroupRole;
            __NameProperty_163: string;
            __NameProperty_164: string;
            __IntProperty_165: number;
            __NameProperty_166: string;
            __NameProperty_167: string;
            __IntProperty_168: number;
            __StructProperty_169: UE.AnimNodeFunctionRef;
            AnimBlueprintExtension_PropertyAccess: UE.AnimSubsystem_PropertyAccess;
            AnimBlueprintExtension_Base: UE.AnimSubsystem_Base;
            AnimGraphNode_Root: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_TransitionResult_7: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_TransitionResult_6: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_BlendSpacePlayer: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_StateResult_5: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_SequencePlayer_3: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_StateResult_4: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_StateMachine_1: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_SaveCachedPose: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_TransitionResult_5: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_TransitionResult_4: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_TransitionResult_3: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_TransitionResult_2: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_TransitionResult_1: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_TransitionResult: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_ApplyAdditive: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_UseCachedPose_1: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_SequencePlayer_2: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_StateResult_3: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_SequencePlayer_1: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_StateResult_2: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_SequencePlayer: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_StateResult_1: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_UseCachedPose: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_StateResult: UE.AnimNodeExposedValueHandler_PropertyAccess;
            AnimGraphNode_StateMachine: UE.AnimNodeExposedValueHandler_PropertyAccess;
            /**
             * @deprecated use StaticStruct instead.
             */
            static StaticClass(): ScriptStruct;
            static StaticStruct(): ScriptStruct;
            __tid_AnimBlueprintGeneratedConstantData_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 2CE1D8194DC8A817A83B5193D4029D33
    namespace Game.Editor.W_Main {
        class W_Main_C extends UE.EditorUtilityWidget {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            ButtonBasicTest: UE.EditorUtilityButton;
            ButtonContainerTest: UE.EditorUtilityButton;
            ButtonMixinTest: UE.EditorUtilityButton;
            ButtonRestartEditor: UE.EditorUtilityButton;
            ButtonUnitTest: UE.EditorUtilityButton;
            BndEvt__W_Main_ButtonBasicTest_K2Node_ComponentBoundEvent_1_OnButtonClickedEvent__DelegateSignature() : void;
            BndEvt__W_Main_ButtonContainerTest_K2Node_ComponentBoundEvent_2_OnButtonClickedEvent__DelegateSignature() : void;
            BndEvt__W_Main_ButtonMixinTest_K2Node_ComponentBoundEvent_3_OnButtonClickedEvent__DelegateSignature() : void;
            BndEvt__W_Main_ButtonRestartEditor_K2Node_ComponentBoundEvent_0_OnButtonClickedEvent__DelegateSignature() : void;
            BndEvt__W_Main_ButtonUnitTest_K2Node_ComponentBoundEvent_4_OnButtonClickedEvent__DelegateSignature() : void;
            ExecuteUbergraph_W_Main(EntryPoint: number) : void;
            OnClick(EventType: string) : void;
            OnClick__puerts_mixin__(EventType: string) : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): W_Main_C;
            static Load(InName: string): W_Main_C;
        
            __tid_W_Main_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
}
