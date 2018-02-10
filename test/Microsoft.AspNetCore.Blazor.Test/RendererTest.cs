﻿// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Blazor.Components;
using Microsoft.AspNetCore.Blazor.Rendering;
using Microsoft.AspNetCore.Blazor.RenderTree;
using Microsoft.AspNetCore.Blazor.Test.Shared;
using Xunit;

namespace Microsoft.AspNetCore.Blazor.Test
{
    public class RendererTest
    {
        [Fact]
        public void CanRenderTopLevelComponents()
        {
            // Arrange
            var renderer = new TestRenderer();
            var component = new TestComponent(builder =>
            {
                builder.OpenElement(0, "my element");
                builder.AddText(1, "some text");
                builder.CloseElement();
            });

            // Act
            var componentId = renderer.AssignComponentId(component);
            renderer.RenderNewBatch(componentId);

            // Assert
            var batch = renderer.Batches.Single();
            var diff = batch.DiffsByComponentId[componentId].Single();
            Assert.Collection(diff.Edits,
                edit =>
                {
                    Assert.Equal(RenderTreeEditType.PrependFrame, edit.Type);
                    Assert.Equal(0, edit.ReferenceFrameIndex);
                });
            AssertFrame.Element(batch.ReferenceFrames[0], "my element", 2);
            AssertFrame.Text(batch.ReferenceFrames[1], "some text");
        }

        [Fact]
        public void CanRenderNestedComponents()
        {
            // Arrange
            var renderer = new TestRenderer();
            var component = new TestComponent(builder =>
            {
                builder.AddText(0, "Hello");
                builder.OpenComponent<MessageComponent>(1);
                builder.AddAttribute(2, nameof(MessageComponent.Message), "Nested component output");
                builder.CloseComponent();
            });

            // Act/Assert
            var componentId = renderer.AssignComponentId(component);
            renderer.RenderNewBatch(componentId);
            var batch = renderer.Batches.Single();
            var componentFrame = batch.ReferenceFrames
                .Single(frame => frame.FrameType == RenderTreeFrameType.Component);
            var nestedComponentId = componentFrame.ComponentId;
            var nestedComponentDiff = batch.DiffsByComponentId[nestedComponentId].Single();

            // We rendered both components
            Assert.Equal(2, batch.DiffsByComponentId.Count);

            // The nested component exists
            Assert.IsType<MessageComponent>(componentFrame.Component);

            // The nested component was rendered as part of the batch
            Assert.Collection(nestedComponentDiff.Edits,
                edit =>
                {
                    Assert.Equal(RenderTreeEditType.PrependFrame, edit.Type);
                    AssertFrame.Text(
                        batch.ReferenceFrames[edit.ReferenceFrameIndex],
                        "Nested component output");
                });
        }

        [Fact]
        public void CanReRenderTopLevelComponents()
        {
            // Arrange
            var renderer = new TestRenderer();
            var component = new MessageComponent { Message = "Initial message" };
            var componentId = renderer.AssignComponentId(component);

            // Act/Assert: first render
            renderer.RenderNewBatch(componentId);
            var batch = renderer.Batches.Single();
            var firstDiff = batch.DiffsByComponentId[componentId].Single();
            Assert.Collection(firstDiff.Edits,
                edit =>
                {
                    Assert.Equal(RenderTreeEditType.PrependFrame, edit.Type);
                    Assert.Equal(0, edit.ReferenceFrameIndex);
                    AssertFrame.Text(batch.ReferenceFrames[0], "Initial message");
                });

            // Act/Assert: second render
            component.Message = "Modified message";
            renderer.RenderNewBatch(componentId);
            var secondBatch = renderer.Batches.Skip(1).Single();
            var secondDiff = secondBatch.DiffsByComponentId[componentId].Single();
            Assert.Collection(secondDiff.Edits,
                edit =>
                {
                    Assert.Equal(RenderTreeEditType.UpdateText, edit.Type);
                    Assert.Equal(0, edit.ReferenceFrameIndex);
                    AssertFrame.Text(secondBatch.ReferenceFrames[0], "Modified message");
                });
        }

        [Fact]
        public void CanReRenderNestedComponents()
        {
            // Arrange: parent component already rendered
            var renderer = new TestRenderer();
            var parentComponent = new TestComponent(builder =>
            {
                builder.OpenComponent<MessageComponent>(0);
                builder.CloseComponent();
            });
            var parentComponentId = renderer.AssignComponentId(parentComponent);
            renderer.RenderNewBatch(parentComponentId);
            var nestedComponentFrame = renderer.Batches.Single()
                .ReferenceFrames
                .Single(frame => frame.FrameType == RenderTreeFrameType.Component);
            var nestedComponent = (MessageComponent)nestedComponentFrame.Component;
            var nestedComponentId = nestedComponentFrame.ComponentId;

            // Assert: inital render
            nestedComponent.Message = "Render 1";
            renderer.RenderNewBatch(nestedComponentId);
            var batch = renderer.Batches[1];
            var firstDiff = batch.DiffsByComponentId[nestedComponentId].Single();
            Assert.Collection(firstDiff.Edits,
                edit =>
                {
                    Assert.Equal(RenderTreeEditType.UpdateText, edit.Type);
                    Assert.Equal(0, edit.ReferenceFrameIndex);
                    AssertFrame.Text(batch.ReferenceFrames[0], "Render 1");
                });

            // Act/Assert: re-render
            nestedComponent.Message = "Render 2";
            renderer.RenderNewBatch(nestedComponentId);
            var secondBatch = renderer.Batches[2];
            var secondDiff = secondBatch.DiffsByComponentId[nestedComponentId].Single();
            Assert.Collection(secondDiff.Edits,
                edit =>
                {
                    Assert.Equal(RenderTreeEditType.UpdateText, edit.Type);
                    Assert.Equal(0, edit.ReferenceFrameIndex);
                    AssertFrame.Text(secondBatch.ReferenceFrames[0], "Render 2");
                });
        }

        [Fact]
        public void CanDispatchEventsToTopLevelComponents()
        {
            // Arrange: Render a component with an event handler
            var renderer = new TestRenderer();
            UIEventArgs receivedArgs = null;

            var component = new EventComponent
            {
                Handler = args => { receivedArgs = args; }
            };
            var componentId = renderer.AssignComponentId(component);
            renderer.RenderNewBatch(componentId);

            var eventHandlerId = renderer.Batches.Single()
                .ReferenceFrames
                .First(frame => frame.AttributeValue != null)
                .AttributeEventHandlerId;

            // Assert: Event not yet fired
            Assert.Null(receivedArgs);

            // Act/Assert: Event can be fired
            var eventArgs = new UIEventArgs();
            renderer.DispatchEvent(componentId, eventHandlerId, eventArgs);
            Assert.Same(eventArgs, receivedArgs);
        }

        [Fact]
        public void CanDispatchEventsToNestedComponents()
        {
            UIEventArgs receivedArgs = null;

            // Arrange: Render parent component
            var renderer = new TestRenderer();
            var parentComponent = new TestComponent(builder =>
            {
                builder.OpenComponent<EventComponent>(0);
                builder.CloseComponent();
            });
            var parentComponentId = renderer.AssignComponentId(parentComponent);
            renderer.RenderNewBatch(parentComponentId);

            // Arrange: Render nested component
            var nestedComponentFrame = renderer.Batches.Single()
                .ReferenceFrames
                .Single(frame => frame.FrameType == RenderTreeFrameType.Component);
            var nestedComponent = (EventComponent)nestedComponentFrame.Component;
            nestedComponent.Handler = args => { receivedArgs = args; };
            var nestedComponentId = nestedComponentFrame.ComponentId;
            renderer.RenderNewBatch(nestedComponentId);

            // Find nested component's event handler ID
            var eventHandlerId = renderer.Batches[1]
                .ReferenceFrames
                .First(frame => frame.AttributeValue != null)
                .AttributeEventHandlerId;

            // Assert: Event not yet fired
            Assert.Null(receivedArgs);

            // Act/Assert: Event can be fired
            var eventArgs = new UIEventArgs();
            renderer.DispatchEvent(nestedComponentId, eventHandlerId, eventArgs);
            Assert.Same(eventArgs, receivedArgs);
        }

        [Fact]
        public void CannotRenderUnknownComponents()
        {
            // Arrange
            var renderer = new TestRenderer();

            // Act/Assert
            Assert.Throws<ArgumentException>(() =>
            {
                renderer.RenderNewBatch(123);
            });
        }

        [Fact]
        public void CannotDispatchEventsToUnknownComponents()
        {
            // Arrange
            var renderer = new TestRenderer();

            // Act/Assert
            Assert.Throws<ArgumentException>(() =>
            {
                renderer.DispatchEvent(123, 0, new UIEventArgs());
            });
        }

        [Fact]
        public void ComponentsCanBeAssociatedWithMultipleRenderers()
        {
            // Arrange
            var renderer1 = new TestRenderer();
            var renderer2 = new TestRenderer();
            var component = new MessageComponent { Message = "Hello, world!" };
            var renderer1ComponentId = renderer1.AssignComponentId(component);
            renderer2.AssignComponentId(new TestComponent(null)); // Just so they don't get the same IDs
            var renderer2ComponentId = renderer2.AssignComponentId(component);

            // Act/Assert: Render component in renderer1
            renderer1.RenderNewBatch(renderer1ComponentId);
            Assert.True(renderer1.Batches.Single().DiffsByComponentId.ContainsKey(renderer1ComponentId));
            Assert.Empty(renderer2.Batches);

            // Act/Assert: Render same component in renderer2
            renderer2.RenderNewBatch(renderer2ComponentId);
            Assert.True(renderer2.Batches.Single().DiffsByComponentId.ContainsKey(renderer2ComponentId));
        }

        [Fact]
        public void PreservesChildComponentInstancesWithNoAttributes()
        {
            // Arrange: First render, capturing child component instance
            var renderer = new TestRenderer();
            var message = "Hello";
            var component = new TestComponent(builder =>
            {
                builder.AddText(0, message);
                builder.OpenComponent<MessageComponent>(1);
                builder.CloseComponent();
            });

            var rootComponentId = renderer.AssignComponentId(component);
            renderer.RenderNewBatch(rootComponentId);

            var nestedComponentFrame = renderer.Batches.Single()
                .ReferenceFrames
                .Single(frame => frame.FrameType == RenderTreeFrameType.Component);
            var nestedComponentInstance = (MessageComponent)nestedComponentFrame.Component;

            // Act: Second render
            message = "Modified message";
            renderer.RenderNewBatch(rootComponentId);

            // Assert
            var batch = renderer.Batches[1];
            var diff = batch.DiffsByComponentId[rootComponentId].Single();
            Assert.Collection(diff.Edits,
                edit =>
                {
                    Assert.Equal(RenderTreeEditType.UpdateText, edit.Type);
                    Assert.Equal(0, edit.ReferenceFrameIndex);
                });
            AssertFrame.Text(batch.ReferenceFrames[0], "Modified message");
            Assert.False(batch.DiffsByComponentId.ContainsKey(nestedComponentFrame.ComponentId));
        }

        [Fact]
        public void UpdatesPropertiesOnRetainedChildComponentInstances()
        {
            // Arrange: First render, capturing child component instance
            var renderer = new TestRenderer();
            var objectThatWillNotChange = new object();
            var firstRender = true;
            var component = new TestComponent(builder =>
            {
                builder.OpenComponent<FakeComponent>(1);
                builder.AddAttribute(2, nameof(FakeComponent.IntProperty), firstRender ? 123 : 256);
                builder.AddAttribute(3, nameof(FakeComponent.ObjectProperty), objectThatWillNotChange);
                builder.AddAttribute(4, nameof(FakeComponent.StringProperty), firstRender ? "String that will change" : "String that did change");
                builder.CloseComponent();
            });

            var rootComponentId = renderer.AssignComponentId(component);
            renderer.RenderNewBatch(rootComponentId);

            var originalComponentFrame = renderer.Batches.Single()
                .ReferenceFrames
                .Single(frame => frame.FrameType == RenderTreeFrameType.Component);
            var childComponentInstance = (FakeComponent)originalComponentFrame.Component;

            // Assert 1: properties were assigned
            Assert.Equal(123, childComponentInstance.IntProperty);
            Assert.Equal("String that will change", childComponentInstance.StringProperty);
            Assert.Same(objectThatWillNotChange, childComponentInstance.ObjectProperty);

            // Act: Second render
            firstRender = false;
            renderer.RenderNewBatch(rootComponentId);

            // Assert
            Assert.Equal(256, childComponentInstance.IntProperty);
            Assert.Equal("String that did change", childComponentInstance.StringProperty);
            Assert.Same(objectThatWillNotChange, childComponentInstance.ObjectProperty);
        }

        [Fact]
        public void ReRendersChildComponentsWhenPropertiesChange()
        {
            // Arrange: First render
            var renderer = new TestRenderer();
            var firstRender = true;
            var component = new TestComponent(builder =>
            {
                builder.OpenComponent<MessageComponent>(1);
                builder.AddAttribute(2, nameof(MessageComponent.Message), firstRender ? "first" : "second");
                builder.CloseComponent();
            });

            var rootComponentId = renderer.AssignComponentId(component);
            renderer.RenderNewBatch(rootComponentId);

            var childComponentId = renderer.Batches.Single()
                .ReferenceFrames
                .Single(frame => frame.FrameType == RenderTreeFrameType.Component)
                .ComponentId;

            // Act: Second render
            firstRender = false;
            renderer.RenderNewBatch(rootComponentId);
            var diff = renderer.Batches[1].DiffsByComponentId[childComponentId].Single();

            // Assert
            Assert.Collection(diff.Edits,
                edit =>
                {
                    Assert.Equal(RenderTreeEditType.UpdateText, edit.Type);
                    Assert.Equal(0, edit.ReferenceFrameIndex);
                });
            AssertFrame.Text(renderer.Batches[1].ReferenceFrames[0], "second");
        }

        [Fact]
        public void NotifiesIHandlePropertiesChangedBeforeFirstRender()
        {
            // Arrange
            var renderer = new TestRenderer();
            var component = new HandlePropertiesChangedComponent();
            var rootComponentId = renderer.AssignComponentId(component);

            // Act
            renderer.RenderNewBatch(rootComponentId);

            // Assert
            AssertFrame.Text(renderer.Batches.Single().ReferenceFrames[0], "Notifications: 1", 0);
        }
        
        [Fact]
        public void NotifiesIHandlePropertiesChangedWhenChanged()
        {
            // Arrange
            var renderer = new TestRenderer();
            var component = new ConditionalParentComponent<HandlePropertiesChangedComponent>
            {
                IncludeChild = true,
                ChildParameters = new Dictionary<string, object>
                {
                    { nameof(HandlePropertiesChangedComponent.IntProperty), 123 }
                }
            };
            var rootComponentId = renderer.AssignComponentId(component);

            // Act/Assert 0: Initial render
            renderer.RenderNewBatch(rootComponentId);
            var batch1 = renderer.Batches.Single();
            var childComponentFrame = batch1
                .ReferenceFrames.Where(frame => frame.FrameType == RenderTreeFrameType.Component).Single();
            var childComponentId = childComponentFrame.ComponentId;
            var diffForChildComponent0 = batch1.DiffsByComponentId[childComponentId].Single();
            var childComponentInstance = (HandlePropertiesChangedComponent)childComponentFrame.Component;
            Assert.Equal(1, childComponentInstance.NotificationsCount);
            Assert.Collection(diffForChildComponent0.Edits,
                edit =>
                {
                    Assert.Equal(RenderTreeEditType.PrependFrame, edit.Type);
                    AssertFrame.Text(batch1.ReferenceFrames[edit.ReferenceFrameIndex], "Notifications: 1", 0);
                });

            // Act/Assert 1: If properties didn't change, we don't notify
            renderer.RenderNewBatch(rootComponentId);
            Assert.Equal(1, childComponentInstance.NotificationsCount);

            // Act/Assert 2: If properties did change, we do notify
            component.ChildParameters[nameof(HandlePropertiesChangedComponent.IntProperty)] = 456;
            renderer.RenderNewBatch(rootComponentId);
            Assert.Equal(2, childComponentInstance.NotificationsCount);
            var batch3 = renderer.Batches.Skip(2).Single();
            var diffForChildComponent2 = batch3.DiffsByComponentId[childComponentId].Single();
            Assert.Equal(2, childComponentInstance.NotificationsCount);
            AssertFrame.Text(batch3.ReferenceFrames[0], "Notifications: 2", 0);
        }

        [Fact]
        public void RenderBatchIncludesListOfDisposedComponents()
        {
            // Arrange
            var renderer = new TestRenderer();
            var firstRender = true;
            var component = new TestComponent(builder =>
            {
                if (firstRender)
                {
                    // Nested descendants
                    builder.OpenComponent<ConditionalParentComponent<FakeComponent>>(100);
                    builder.AddAttribute(101, nameof(ConditionalParentComponent<FakeComponent>.IncludeChild), true);
                    builder.CloseComponent();
                }
                builder.OpenComponent<FakeComponent>(200);
                builder.CloseComponent();
            });

            var rootComponentId = renderer.AssignComponentId(component);

            // Act/Assert 1: First render, capturing child component IDs
            renderer.RenderNewBatch(rootComponentId);
            var batch = renderer.Batches.Single();
            var rootComponentDiff = batch.DiffsByComponentId[rootComponentId].Single();
            var childComponentIds = rootComponentDiff
                .Edits
                .Select(edit => batch.ReferenceFrames[edit.ReferenceFrameIndex])
                .Where(frame => frame.FrameType == RenderTreeFrameType.Component)
                .Select(frame => frame.ComponentId)
                .ToList();
            Assert.Equal(new[] { 1, 2 }, childComponentIds);

            // Act: Second render
            firstRender = false;
            renderer.RenderNewBatch(rootComponentId);

            // Assert: Applicable children are included in disposal list
            Assert.Equal(new[] { 1, 3 }, renderer.Batches[1].DisposedComponentIDs);
        }

        [Fact]
        public void DisposesEventHandlersWhenAttributeValueChanged()
        {
            // Arrange
            var renderer = new TestRenderer();
            var eventCount = 0;
            UIEventHandler origEventHandler = args => { eventCount++; };
            var component = new EventComponent { Handler = origEventHandler };
            var componentId = renderer.AssignComponentId(component);
            renderer.RenderNewBatch(componentId);
            var origEventHandlerId = renderer.Batches.Single()
                .ReferenceFrames
                .Where(f => f.FrameType == RenderTreeFrameType.Attribute)
                .Single(f => f.AttributeEventHandlerId != 0)
                .AttributeEventHandlerId;

            // Act/Assert 1: Event handler fires when we trigger it
            Assert.Equal(0, eventCount);
            renderer.DispatchEvent(componentId, origEventHandlerId, args: null);
            Assert.Equal(1, eventCount);

            // Now change the attribute value
            var newEventCount = 0;
            component.Handler = args => { newEventCount++; };
            renderer.RenderNewBatch(componentId);

            // Act/Assert 2: Can no longer fire the original event, but can fire the new event
            Assert.Throws<ArgumentException>(() =>
            {
                renderer.DispatchEvent(componentId, origEventHandlerId, args: null);
            });
            Assert.Equal(1, eventCount);
            Assert.Equal(0, newEventCount);
            renderer.DispatchEvent(componentId, origEventHandlerId + 1, args: null);
            Assert.Equal(1, newEventCount);
        }

        [Fact]
        public void DisposesEventHandlersWhenAttributeRemoved()
        {
            // Arrange
            var renderer = new TestRenderer();
            var eventCount = 0;
            UIEventHandler origEventHandler = args => { eventCount++; };
            var component = new EventComponent { Handler = origEventHandler };
            var componentId = renderer.AssignComponentId(component);
            renderer.RenderNewBatch(componentId);
            var origEventHandlerId = renderer.Batches.Single()
                .ReferenceFrames
                .Where(f => f.FrameType == RenderTreeFrameType.Attribute)
                .Single(f => f.AttributeEventHandlerId != 0)
                .AttributeEventHandlerId;

            // Act/Assert 1: Event handler fires when we trigger it
            Assert.Equal(0, eventCount);
            renderer.DispatchEvent(componentId, origEventHandlerId, args: null);
            Assert.Equal(1, eventCount);

            // Now remove the event attribute
            component.Handler = null;
            renderer.RenderNewBatch(componentId);

            // Act/Assert 2: Can no longer fire the original event
            Assert.Throws<ArgumentException>(() =>
            {
                renderer.DispatchEvent(componentId, origEventHandlerId, args: null);
            });
            Assert.Equal(1, eventCount);
        }

        [Fact]
        public void DisposesEventHandlersWhenOwnerComponentRemoved()
        {
            // Arrange
            var renderer = new TestRenderer();
            var eventCount = 0;
            UIEventHandler origEventHandler = args => { eventCount++; };
            var component = new ConditionalParentComponent<EventComponent>
            {
                IncludeChild = true,
                ChildParameters = new Dictionary<string, object>
                {
                    { nameof(EventComponent.Handler), origEventHandler }
                }
            };
            var rootComponentId = renderer.AssignComponentId(component);
            renderer.RenderNewBatch(rootComponentId);
            var batch = renderer.Batches.Single();
            var rootComponentDiff = batch.DiffsByComponentId[rootComponentId].Single();
            var rootComponentFrame = batch.ReferenceFrames[0];
            var childComponentFrame = rootComponentDiff.Edits
                .Select(e => batch.ReferenceFrames[e.ReferenceFrameIndex])
                .Where(f => f.FrameType == RenderTreeFrameType.Component)
                .Single();
            var childComponentId = childComponentFrame.ComponentId;
            var childComponentDiff = batch.DiffsByComponentId[childComponentFrame.ComponentId].Single();
            var eventHandlerId = batch.ReferenceFrames
                .Skip(childComponentDiff.Edits[0].ReferenceFrameIndex) // Search from where the child component frames start
                .Where(f => f.FrameType == RenderTreeFrameType.Attribute)
                .Single(f => f.AttributeEventHandlerId != 0)
                .AttributeEventHandlerId;

            // Act/Assert 1: Event handler fires when we trigger it
            Assert.Equal(0, eventCount);
            renderer.DispatchEvent(childComponentId, eventHandlerId, args: null);
            Assert.Equal(1, eventCount);

            // Now remove the EventComponent
            component.IncludeChild = false;
            renderer.RenderNewBatch(rootComponentId);

            // Act/Assert 2: Can no longer fire the original event
            Assert.Throws<ArgumentException>(() =>
            {
                renderer.DispatchEvent(eventHandlerId, eventHandlerId, args: null);
            });
            Assert.Equal(1, eventCount);
        }

        [Fact]
        public void DisposesEventHandlersWhenAncestorElementRemoved()
        {
            // Arrange
            var renderer = new TestRenderer();
            var eventCount = 0;
            UIEventHandler origEventHandler = args => { eventCount++; };
            var component = new EventComponent { Handler = origEventHandler };
            var componentId = renderer.AssignComponentId(component);
            renderer.RenderNewBatch(componentId);
            var origEventHandlerId = renderer.Batches.Single()
                .ReferenceFrames
                .Where(f => f.FrameType == RenderTreeFrameType.Attribute)
                .Single(f => f.AttributeEventHandlerId != 0)
                .AttributeEventHandlerId;

            // Act/Assert 1: Event handler fires when we trigger it
            Assert.Equal(0, eventCount);
            renderer.DispatchEvent(componentId, origEventHandlerId, args: null);
            Assert.Equal(1, eventCount);

            // Now remove the ancestor element
            component.SkipElement = true;
            renderer.RenderNewBatch(componentId);

            // Act/Assert 2: Can no longer fire the original event
            Assert.Throws<ArgumentException>(() =>
            {
                renderer.DispatchEvent(componentId, origEventHandlerId, args: null);
            });
            Assert.Equal(1, eventCount);
        }

        private class NoOpRenderer : Renderer
        {
            public new int AssignComponentId(IComponent component)
                => base.AssignComponentId(component);

            public new void RenderNewBatch(int componentId)
                => base.RenderNewBatch(componentId);

            protected override void UpdateDisplay(RenderBatch renderBatch)
            {
            }
        }

        private class TestRenderer : Renderer
        {
            public List<CapturedBatch> Batches { get; }
                = new List<CapturedBatch>();

            public new int AssignComponentId(IComponent component)
                => base.AssignComponentId(component);

            public new void RenderNewBatch(int componentId)
                => base.RenderNewBatch(componentId);

            public new void DispatchEvent(int componentId, int eventHandlerId, UIEventArgs args)
                => base.DispatchEvent(componentId, eventHandlerId, args);

            protected override void UpdateDisplay(RenderBatch renderBatch)
            {
                var capturedBatch = new CapturedBatch();
                Batches.Add(capturedBatch);

                for (var i = 0; i < renderBatch.UpdatedComponents.Count; i++)
                {
                    ref var renderTreeDiff = ref renderBatch.UpdatedComponents.Array[i];
                    capturedBatch.AddDiff(renderTreeDiff);
                }

                // Clone other data, as underlying storage will get reused by later batches
                capturedBatch.ReferenceFrames = renderBatch.ReferenceFrames.ToArray();
                capturedBatch.DisposedComponentIDs = renderBatch.DisposedComponentIDs.ToList();
            }
        }

        private class CapturedBatch
        {
            public IDictionary<int, List<RenderTreeDiff>> DiffsByComponentId { get; }
                = new Dictionary<int, List<RenderTreeDiff>>();

            public IList<int> DisposedComponentIDs { get; set; }
            public RenderTreeFrame[] ReferenceFrames { get; set; }

            internal void AddDiff(RenderTreeDiff diff)
            {
                var componentId = diff.ComponentId;
                if (!DiffsByComponentId.ContainsKey(componentId))
                {
                    DiffsByComponentId.Add(componentId, new List<RenderTreeDiff>());
                }

                // Clone the diff, because its underlying storage will get reused in subsequent batches
                DiffsByComponentId[componentId].Add(new RenderTreeDiff(
                    diff.ComponentId,
                    new ArraySegment<RenderTreeEdit>(diff.Edits.ToArray())));
            }
        }

        private class TestComponent : IComponent
        {
            private Action<RenderTreeBuilder> _renderAction;

            public TestComponent(Action<RenderTreeBuilder> renderAction)
            {
                _renderAction = renderAction;
            }

            public void BuildRenderTree(RenderTreeBuilder builder)
                => _renderAction(builder);
        }

        private class MessageComponent : IComponent
        {
            public string Message { get; set; }

            public void BuildRenderTree(RenderTreeBuilder builder)
            {
                builder.AddText(0, Message);
            }
        }

        private class FakeComponent : IComponent
        {
            public int IntProperty { get; set; }
            public string StringProperty { get; set; }
            public object ObjectProperty { get; set; }

            public void BuildRenderTree(RenderTreeBuilder builder)
            {
            }
        }

        private class EventComponent : IComponent
        {
            public UIEventHandler Handler { get; set; }
            public bool SkipElement { get; set; }

            public void BuildRenderTree(RenderTreeBuilder builder)
            {
                builder.OpenElement(0, "grandparent");
                if (!SkipElement)
                {
                    builder.OpenElement(1, "parent");
                    builder.OpenElement(2, "some element");
                    if (Handler != null)
                    {
                        builder.AddAttribute(3, "some event", Handler);
                    }
                    builder.CloseElement();
                    builder.CloseElement();
                }
                builder.CloseElement();
            }
        }

        private class ConditionalParentComponent<T> : IComponent where T : IComponent
        {
            public bool IncludeChild { get; set; }
            public IDictionary<string, object> ChildParameters { get; set; }

            public void BuildRenderTree(RenderTreeBuilder builder)
            {
                builder.AddText(0, "Parent here");
                
                if (IncludeChild)
                {
                    builder.OpenComponent<T>(1);
                    if (ChildParameters != null)
                    {
                        var sequence = 2;
                        foreach (var kvp in ChildParameters)
                        {
                            builder.AddAttribute(sequence++, kvp.Key, kvp.Value);
                        }
                    }
                    builder.CloseComponent();
                }
            }
        }

        private class HandlePropertiesChangedComponent : IComponent, IHandlePropertiesChanged
        {
            public int NotificationsCount { get; private set; }

            public int IntProperty { get; set; }

            public void BuildRenderTree(RenderTreeBuilder builder)
            {
                builder.AddText(0, $"Notifications: {NotificationsCount}");
            }

            public void OnPropertiesChanged()
            {
                NotificationsCount++;
            }
        }

        (int, T) FirstWithIndex<T>(IEnumerable<T> items, Predicate<T> predicate)
        {
            var index = 0;
            foreach (var item in items)
            {
                if (predicate(item))
                {
                    return (index, item);
                }

                index++;
            }

            throw new InvalidOperationException("No matching element was found.");
        }
    }
}
